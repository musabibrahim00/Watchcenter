/**
 * Case-Asset Integration Utilities
 * =================================
 * 
 * Utilities for linking cases to assets in the Asset Register.
 */

/**
 * Extracted asset information from case description
 */
export interface ExtractedAsset {
  id: string;
  name: string;
  arn?: string;
  privateIp?: string;
  riskSeverity?: string;
}

/**
 * Extract asset information from case description
 * Parses markdown-formatted case descriptions to find asset details
 */
export function extractAssetsFromDescription(description: string): ExtractedAsset[] {
  const assets: ExtractedAsset[] = [];
  
  // Pattern to match "**Affected Asset:**" section
  const affectedAssetRegex = /\*\*Affected Asset:\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/g;
  const matches = description.matchAll(affectedAssetRegex);
  
  for (const match of matches) {
    const section = match[1];
    const asset: Partial<ExtractedAsset> = {};
    
    // Extract asset name
    const nameMatch = section.match(/- Name:\s*(.+?)(?:\n|$)/);
    if (nameMatch) asset.name = nameMatch[1].trim();
    
    // Extract asset ID
    const idMatch = section.match(/- Asset ID:\s*(.+?)(?:\n|$)/);
    if (idMatch) asset.id = idMatch[1].trim();
    
    // Extract ARN
    const arnMatch = section.match(/- ARN:\s*(.+?)(?:\n|$)/);
    if (arnMatch) asset.arn = arnMatch[1].trim();
    
    // Extract Private IP
    const ipMatch = section.match(/- Private IP:\s*(.+?)(?:\n|$)/);
    if (ipMatch) asset.privateIp = ipMatch[1].trim();
    
    // Extract Risk Severity
    const severityMatch = section.match(/- Risk Severity:\s*(.+?)(?:\n|$)/);
    if (severityMatch) asset.riskSeverity = severityMatch[1].trim();
    
    // Only add if we have at least ID and name
    if (asset.id && asset.name) {
      assets.push(asset as ExtractedAsset);
    }
  }
  
  return assets;
}

/**
 * Format description with clickable asset links
 * Converts plain text asset IDs to interactive elements
 */
export function formatDescriptionWithAssetLinks(description: string): {
  text: string;
  assetIds: string[];
} {
  const assets = extractAssetsFromDescription(description);
  const assetIds = assets.map(a => a.id);
  
  return {
    text: description,
    assetIds,
  };
}

/**
 * Extract asset IDs from various text formats
 * Supports multiple patterns: br-1, asset-123, i-0a3f7c9d, etc.
 */
export function extractAssetIdsFromText(text: string): string[] {
  const ids: string[] = [];
  
  // Pattern 1: Asset ID: value
  const assetIdPattern = /Asset ID:\s*([a-zA-Z0-9_-]+)/gi;
  const assetIdMatches = text.matchAll(assetIdPattern);
  for (const match of assetIdMatches) {
    ids.push(match[1]);
  }
  
  // Pattern 2: Standalone IDs (br-1, br-2, etc.)
  const brPattern = /\bbr-\d+\b/gi;
  const brMatches = text.matchAll(brPattern);
  for (const match of brMatches) {
    ids.push(match[0]);
  }
  
  // Pattern 3: AWS instance IDs
  const instancePattern = /\bi-[a-z0-9]{8,}\b/gi;
  const instanceMatches = text.matchAll(instancePattern);
  for (const match of instanceMatches) {
    ids.push(match[0]);
  }
  
  // Deduplicate
  return Array.from(new Set(ids));
}
