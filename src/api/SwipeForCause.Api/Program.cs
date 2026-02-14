using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SwipeForCause.Api.Common;
using SwipeForCause.Api.Database;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Global exception handling
app.UseMiddleware<GlobalExceptionHandler>();

// Swagger (development only)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();

// Health check endpoint
app.MapHealthChecks("/health");

app.Run();

// Make Program class accessible for integration tests
public partial class Program { }
