// =============================================================================
// Module: Azure CDN — Standard Microsoft tier, HTTPS only
// =============================================================================

@description('Deployment environment.')
param environment string

@description('Resource tags.')
param tags object

@description('Storage account name used as CDN origin.')
param storageAccountName string

// ---------------------------------------------------------------------------
// Variables
// ---------------------------------------------------------------------------

var prefix = 'sfc'
var cdnProfileName = '${prefix}-cdn-${environment}'
var cdnEndpointName = '${prefix}-cdn-ep-${environment}'
var storageHostName = '${storageAccountName}.blob.${az.environment().suffixes.storage}'

// ---------------------------------------------------------------------------
// CDN Profile
// ---------------------------------------------------------------------------

resource cdnProfile 'Microsoft.Cdn/profiles@2024-02-01' = {
  name: cdnProfileName
  location: 'global'
  tags: tags
  sku: {
    name: 'Standard_Microsoft'
  }
}

// ---------------------------------------------------------------------------
// CDN Endpoint — HTTPS only, caching rules for media
// ---------------------------------------------------------------------------

resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2024-02-01' = {
  parent: cdnProfile
  name: cdnEndpointName
  location: 'global'
  tags: tags
  properties: {
    isHttpAllowed: false
    isHttpsAllowed: true
    originHostHeader: storageHostName
    origins: [
      {
        name: 'blob-origin'
        properties: {
          hostName: storageHostName
          httpsPort: 443
          originHostHeader: storageHostName
        }
      }
    ]
    deliveryPolicy: {
      rules: [
        {
          name: 'BlockUploadsContainer'
          order: 1
          conditions: [
            {
              name: 'UrlPath'
              parameters: {
                typeName: 'DeliveryRuleUrlPathMatchConditionParameters'
                operator: 'BeginsWith'
                matchValues: ['/uploads/']
                negateCondition: false
                transforms: ['Lowercase']
              }
            }
          ]
          actions: [
            {
              name: 'UrlRewrite'
              parameters: {
                typeName: 'DeliveryRuleUrlRewriteActionParameters'
                sourcePattern: '/uploads/'
                destination: '/blocked'
                preserveUnmatchedPath: false
              }
            }
          ]
        }
        {
          name: 'CacheImagesAndVideos'
          order: 2
          conditions: [
            {
              name: 'UrlPath'
              parameters: {
                typeName: 'DeliveryRuleUrlPathMatchConditionParameters'
                operator: 'BeginsWith'
                matchValues: ['/images/', '/videos/', '/avatars/', '/logos/']
                negateCondition: false
                transforms: ['Lowercase']
              }
            }
          ]
          actions: [
            {
              name: 'CacheExpiration'
              parameters: {
                typeName: 'DeliveryRuleCacheExpirationActionParameters'
                cacheBehavior: 'Override'
                cacheType: 'All'
                cacheDuration: '7.00:00:00'
              }
            }
          ]
        }
      ]
    }
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

output cdnProfileName string = cdnProfile.name
output cdnEndpointName string = cdnEndpoint.name
output cdnEndpointHostName string = cdnEndpoint.properties.hostName
output cdnEndpointUrl string = 'https://${cdnEndpoint.properties.hostName}'
