// =============================================================================
// Module: App Service — .NET 8 API with staging deployment slot
// =============================================================================

@description('Deployment environment.')
param environment string

@description('Azure region.')
param location string

@description('Resource tags.')
param tags object

@description('Storage account name for connection string.')
param storageAccountName string

@description('Storage account key.')
@secure()
param storageAccountKey string

@description('CDN endpoint hostname.')
param cdnEndpointHostName string

@description('Function App default hostname.')
param functionAppHostName string

@description('PostgreSQL FQDN.')
param postgresHost string

@description('PostgreSQL admin username.')
param postgresAdminUser string

@description('PostgreSQL admin password.')
@secure()
param postgresAdminPassword string

@description('PostgreSQL database name.')
param postgresDbName string

@description('Clerk secret key.')
@secure()
param clerkSecretKey string

@description('SendGrid API key.')
@secure()
param sendGridApiKey string

// ---------------------------------------------------------------------------
// Variables
// ---------------------------------------------------------------------------

var prefix = 'sfc'
var appServicePlanName = '${prefix}-plan-${environment}'
var apiAppName = '${prefix}-api-${environment}'

// ---------------------------------------------------------------------------
// App Service Plan (B1 Linux)
// ---------------------------------------------------------------------------

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  sku: {
    name: 'B1'
    tier: 'Basic'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// ---------------------------------------------------------------------------
// App Service — .NET 8 API
// ---------------------------------------------------------------------------

resource apiApp 'Microsoft.Web/sites@2023-12-01' = {
  name: apiAppName
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      alwaysOn: true
      appSettings: [
        { name: 'ASPNETCORE_ENVIRONMENT', value: environment == 'prod' ? 'Production' : 'Development' }
        { name: 'Clerk__SecretKey', value: clerkSecretKey }
        { name: 'SendGrid__ApiKey', value: sendGridApiKey }
        { name: 'Storage__ConnectionString', value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${storageAccountKey};EndpointSuffix=core.windows.net' }
        { name: 'Storage__CdnBaseUrl', value: 'https://${cdnEndpointHostName}' }
        { name: 'FunctionApp__BaseUrl', value: 'https://${functionAppHostName}' }
      ]
      connectionStrings: [
        {
          name: 'DefaultConnection'
          connectionString: 'Host=${postgresHost};Port=5432;Database=${postgresDbName};Username=${postgresAdminUser};Password=${postgresAdminPassword};SSL Mode=Require;Trust Server Certificate=true'
          type: 'Custom'
        }
      ]
    }
  }
}

// ---------------------------------------------------------------------------
// Staging deployment slot
// ---------------------------------------------------------------------------

resource stagingSlot 'Microsoft.Web/sites/slots@2023-12-01' = {
  parent: apiApp
  name: 'staging'
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      alwaysOn: false
      appSettings: [
        { name: 'ASPNETCORE_ENVIRONMENT', value: 'Staging' }
        { name: 'Clerk__SecretKey', value: clerkSecretKey }
        { name: 'SendGrid__ApiKey', value: sendGridApiKey }
        { name: 'Storage__ConnectionString', value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${storageAccountKey};EndpointSuffix=core.windows.net' }
        { name: 'Storage__CdnBaseUrl', value: 'https://${cdnEndpointHostName}' }
        { name: 'FunctionApp__BaseUrl', value: 'https://${functionAppHostName}' }
      ]
      connectionStrings: [
        {
          name: 'DefaultConnection'
          connectionString: 'Host=${postgresHost};Port=5432;Database=${postgresDbName};Username=${postgresAdminUser};Password=${postgresAdminPassword};SSL Mode=Require;Trust Server Certificate=true'
          type: 'Custom'
        }
      ]
    }
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

output apiAppName string = apiApp.name
output apiUrl string = 'https://${apiApp.properties.defaultHostName}'
output apiPrincipalId string = apiApp.identity.principalId
output stagingUrl string = 'https://${stagingSlot.properties.defaultHostName}'
