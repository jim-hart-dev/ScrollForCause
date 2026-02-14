// =============================================================================
// Module: Azure Functions — media processing (Consumption plan)
// =============================================================================

@description('Deployment environment.')
param environment string

@description('Azure region.')
param location string

@description('Resource tags.')
param tags object

@description('Media storage account name.')
param mediaStorageAccountName string

@description('Media storage account key.')
@secure()
param mediaStorageAccountKey string

// ---------------------------------------------------------------------------
// Variables
// ---------------------------------------------------------------------------

var prefix = 'sfc'
var functionAppName = '${prefix}-func-${environment}'
var functionPlanName = '${prefix}-funcplan-${environment}'
var functionStorageName = '${prefix}funcstor${environment}'

// ---------------------------------------------------------------------------
// Dedicated storage account for Function App runtime
// ---------------------------------------------------------------------------

resource functionStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: functionStorageName
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

// ---------------------------------------------------------------------------
// Consumption plan (Y1)
// ---------------------------------------------------------------------------

resource functionPlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: functionPlanName
  location: location
  tags: tags
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  kind: 'functionapp'
  properties: {
    reserved: true
  }
}

// ---------------------------------------------------------------------------
// Function App — .NET 8 isolated runtime
// ---------------------------------------------------------------------------

resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: functionAppName
  location: location
  tags: tags
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: functionPlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNET-ISOLATED|8.0'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      appSettings: [
        { name: 'AzureWebJobsStorage', value: 'DefaultEndpointsProtocol=https;AccountName=${functionStorageName};AccountKey=${functionStorage.listKeys().keys[0].value};EndpointSuffix=core.windows.net' }
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' }
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'dotnet-isolated' }
        { name: 'MediaStorage__ConnectionString', value: 'DefaultEndpointsProtocol=https;AccountName=${mediaStorageAccountName};AccountKey=${mediaStorageAccountKey};EndpointSuffix=core.windows.net' }
      ]
    }
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

output functionAppName string = functionApp.name
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output functionAppHostName string = functionApp.properties.defaultHostName
output functionAppPrincipalId string = functionApp.identity.principalId
