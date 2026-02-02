import { existsSync } from "fs"
import { basename, dirname, extname, resolve } from 'path'

/**
 * Generates potential JSON filenames for media files that contain a counter pattern like (1), (2), etc.
 * Handles multiple patterns:
 * 1. "foo(1).jpg" -> "foo.jpg(1).json" (counter is after extension)
 * 2. "2013-12-03(1).jpg" -> "2013-12-03.supplemental-metadata(1).json" (counter is before extension)
 */
function generateJsonNamesForCounterPattern(
  mediaFileNameWithoutExtension: string,
  mediaFileExtension: string,
): string[] {
  const jsonNames: string[] = [];
  
  // Check if the filename contains a counter pattern like (1), (2), etc.
  const counterMatch = mediaFileNameWithoutExtension.match(/(?<name>.*)(?<counter>\(\d+\))$/);
  if (!counterMatch) {
    return jsonNames; // No counter found
  }
  
  const name = counterMatch.groups?.['name'];
  const counter = counterMatch.groups?.['counter'];

  if (!name || !counter) {
    return jsonNames;
  }
  
  // Pattern 1: Original logic - counter moved after extension
  // Example: "foo(1).jpg" -> "foo.jpg(1).json"
  jsonNames.push(`${name}${mediaFileExtension}${counter}.json`);
  
  // Pattern 2: Counter stays with base name, various JSON naming patterns
  // Example: "2013-12-03(1).jpg" -> multiple variations
  jsonNames.push(
    `${name}${counter}.json`,                                    // "2013-12-03(1).json"
    `${name}.supplemental-metadata${counter}.json`,             // "2013-12-03.supplemental-metadata(1).json"
    `${name}${mediaFileExtension}.supplemental-metadat${counter}.json`,             // "2013-12-03.jpg.supplemental-metadat(1).json"
    `${name}${mediaFileExtension}.supplemental-metadata${counter}.json`,             // "2013-12-03.jpg.supplemental-metadata(1).json"
    `${name}.supplemental-metad${counter}.json`                // "2013-12-03.supplemental-metad(1).json"
  );
  
  return jsonNames;
}

export function getCompanionJsonPathForMediaFile(mediaFilePath: string): string|null {
  const directoryPath = dirname(mediaFilePath);
  const mediaFileExtension = extname(mediaFilePath);
  let mediaFileNameWithoutExtension = basename(mediaFilePath, mediaFileExtension);
  const mediaFileNameWithExtension = basename(mediaFilePath);

  // The naming pattern for the JSON sidecar files provided by Google Takeout seem to be inconsistent. For `foo.jpg`,
  // the JSON file is sometimes `foo.json` but sometimes it's `foo.jpg.json`. Here we start building up a list of potential
  // JSON filenames so that we can try to find them later
  const expansionMapper = (x: string) => ([
    `${x}.json`,
    `${x}.jp.json`,
    `${x}.supplemental-metadata.json`,
    `${x}.supplemental-metadat.json`,
    `${x}.supplemental-metada.json`,
    `${x}.supplemental-metad.json`,
    `${x}.supplemental-meta.json`,
    `${x}.supplemental-met.json`,
    `${x}.supplemental-me.json`,
    `${x}.supplemental-m.json`,
    `${x}.supplemental-.json`,
    `${x}.supplemental.json`,
    `${x}.supplementa.json`,
    `${x}.supplement.json`,
    `${x}.supplem.json`,
    `${x}.supp.json`,
    `${x}.sup.json`,
    `${x}.su.json`,
    `${x}.s.json`,
  ]);

  const expandedPotentialJsonFileNames: string[] = [
    ...expansionMapper(mediaFileNameWithExtension),
    ...expansionMapper(mediaFileNameWithoutExtension),
    // Sometimes (if the photo has been edited inside Google Photos) we get files with a `-edited` suffix
    // These images don't have their own .json sidecars - for these we'd want to use the JSON sidecar for the original image
    // so we can ignore the "-edited" suffix if there is one
    ...expansionMapper(mediaFileNameWithExtension.replace(/[-]edited/i, '')),
    ...expansionMapper(mediaFileNameWithoutExtension.replace(/[-]edited/i, '')),
  ];

  // Handle files with counter patterns (e.g., "foo(1).jpg" or "2013-12-03(1).jpg")
  const counterJsonNames = generateJsonNamesForCounterPattern(
    mediaFileNameWithoutExtension,
    mediaFileExtension,
  );
  expandedPotentialJsonFileNames.push(...counterJsonNames);

  // Sometimes the media filename ends with extra dash (eg. filename_n-.jpg + filename_n.json)
  const endsWithExtraDash = mediaFileNameWithoutExtension.endsWith('_n-');

  // Sometimes the media filename ends with extra `n` char (eg. filename_n.jpg + filename_.json)
  const endsWithExtraNChar = mediaFileNameWithoutExtension.endsWith('_n');

  // And sometimes the media filename has extra underscore in it (e.g. filename_.jpg + filename.json)
  const endsWithExtraUnderscore = mediaFileNameWithoutExtension.endsWith('_');

  if (endsWithExtraDash || endsWithExtraNChar || endsWithExtraUnderscore) {
    // We need to remove that extra char at the end
    expandedPotentialJsonFileNames.push(`${mediaFileNameWithoutExtension.slice(0, -1)}.json`);
  }

  // Check for live photos, match on the jpg json file
  if (mediaFileNameWithExtension.startsWith('MVIMG')) {
    expandedPotentialJsonFileNames.push(...expansionMapper(`${mediaFileNameWithoutExtension}.jpg`));

    const counterJsonNames = generateJsonNamesForCounterPattern(mediaFileNameWithoutExtension, '.jpg');
    expandedPotentialJsonFileNames.push(...counterJsonNames);
  }

  // Now look to see if we have a JSON file in the same directory as the image for any of the potential JSON file names
  // that we identified earlier
  for (const potentialJsonFileName of expandedPotentialJsonFileNames) {
    const jsonFilePath = resolve(directoryPath, potentialJsonFileName);
    if (existsSync(jsonFilePath)) {
      return jsonFilePath;
    }
  }

  // If no JSON file was found, just return null - we won't be able to adjust the date timestamps without finding a
  // suitable JSON sidecar file
  return null;
}
