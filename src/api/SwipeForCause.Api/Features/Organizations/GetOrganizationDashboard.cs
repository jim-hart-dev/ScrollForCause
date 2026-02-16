using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SwipeForCause.Api.Common;
using SwipeForCause.Api.Database;
using SwipeForCause.Api.Infrastructure.Auth;

namespace SwipeForCause.Api.Features.Organizations;

public record OrgDashboardStats(
    int NewInterestCount,
    int ActiveOpportunityCount,
    int FollowerCount);

public record InterestSummary(
    Guid InterestId,
    string VolunteerName,
    string? VolunteerAvatarUrl,
    string OpportunityTitle,
    string Status,
    DateTime CreatedAt);

public record PostSummary(
    Guid PostId,
    string Title,
    string? ThumbnailUrl,
    int ViewCount,
    DateTime CreatedAt);

public record SetupChecklist(
    bool HasCoverImage,
    bool HasOpportunity,
    bool HasPost);

public record GetOrgDashboardResponse(
    Guid OrganizationId,
    string OrganizationName,
    string VerificationStatus,
    OrgDashboardStats? Stats,
    List<InterestSummary> RecentInterests,
    List<PostSummary> RecentPosts,
    SetupChecklist? SetupChecklist);

public static class GetOrganizationDashboard
{
    public static void MapGetOrganizationDashboard(this WebApplication app)
    {
        app.MapGet("/api/v1/organizations/dashboard", async (
            ClaimsPrincipal user,
            AppDbContext db) =>
        {
            var currentUser = user.ToCurrentUser();

            // Look up organization by ClerkUserId
            var org = await db.Organizations
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.ClerkUserId == currentUser.ClerkUserId && o.IsActive);

            if (org is null)
            {
                return Results.NotFound(new ErrorResponse
                {
                    Error = new ErrorDetail
                    {
                        Code = "ORGANIZATION_NOT_FOUND",
                        Message = "No organization profile found for this user.",
                    },
                });
            }

            // If not verified, return limited response
            if (org.VerificationStatus != "verified")
            {
                return Results.Ok(new GetOrgDashboardResponse(
                    OrganizationId: org.Id,
                    OrganizationName: org.Name,
                    VerificationStatus: org.VerificationStatus,
                    Stats: null,
                    RecentInterests: [],
                    RecentPosts: [],
                    SetupChecklist: null));
            }

            // Get stats
            var orgOpportunityIds = await db.Opportunities
                .Where(o => o.OrganizationId == org.Id && o.Status == "active")
                .Select(o => o.Id)
                .ToListAsync();

            var newInterestCount = await db.VolunteerInterests
                .CountAsync(vi => orgOpportunityIds.Contains(vi.OpportunityId) && vi.Status == "pending");

            var activeOpportunityCount = orgOpportunityIds.Count;

            var stats = new OrgDashboardStats(
                NewInterestCount: newInterestCount,
                ActiveOpportunityCount: activeOpportunityCount,
                FollowerCount: org.FollowerCount);

            // Recent interests (latest 5 across all org opportunities)
            var allOrgOpportunityIds = await db.Opportunities
                .Where(o => o.OrganizationId == org.Id)
                .Select(o => o.Id)
                .ToListAsync();

            var recentInterests = await db.VolunteerInterests
                .Where(vi => allOrgOpportunityIds.Contains(vi.OpportunityId))
                .OrderByDescending(vi => vi.CreatedAt)
                .Take(5)
                .Select(vi => new InterestSummary(
                    vi.Id,
                    vi.Volunteer.DisplayName,
                    vi.Volunteer.AvatarUrl,
                    vi.Opportunity.Title,
                    vi.Status,
                    vi.CreatedAt))
                .ToListAsync();

            // Recent posts (latest 3)
            var recentPosts = await db.Posts
                .Where(p => p.OrganizationId == org.Id)
                .OrderByDescending(p => p.CreatedAt)
                .Take(3)
                .Select(p => new PostSummary(
                    p.Id,
                    p.Title,
                    p.Media.OrderBy(m => m.DisplayOrder).Select(m => m.ThumbnailUrl).FirstOrDefault(),
                    p.ViewCount,
                    p.CreatedAt))
                .ToListAsync();

            // Setup checklist
            var hasOpportunity = await db.Opportunities
                .AnyAsync(o => o.OrganizationId == org.Id);
            var hasPost = await db.Posts
                .AnyAsync(p => p.OrganizationId == org.Id);

            var setupChecklist = new SetupChecklist(
                HasCoverImage: !string.IsNullOrEmpty(org.CoverImageUrl),
                HasOpportunity: hasOpportunity,
                HasPost: hasPost);

            return Results.Ok(new GetOrgDashboardResponse(
                OrganizationId: org.Id,
                OrganizationName: org.Name,
                VerificationStatus: org.VerificationStatus,
                Stats: stats,
                RecentInterests: recentInterests,
                RecentPosts: recentPosts,
                SetupChecklist: setupChecklist));
        })
        .RequireAuthorization("Organization")
        .WithTags("Organizations")
        .WithName("GetOrganizationDashboard");
    }
}
