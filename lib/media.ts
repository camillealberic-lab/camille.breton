/**
 * Media helpers — centralized so `isVideo` isn't copy-pasted across
 * ArchivePanel.tsx, page.tsx, ProjectDetail.tsx (used to live in 3 files).
 *
 * Extending the supported extension list now only requires one edit.
 */

export const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'] as const;

const VIDEO_REGEX = new RegExp(`\\.(${VIDEO_EXTENSIONS.join('|')})$`, 'i');

export const isVideo = (src: string): boolean => VIDEO_REGEX.test(src);

/** Common media sizes attribute for responsive images.
 *  "(max-width: 768px) 100vw, 50vw" — mobile uses full width, desktop
 *  split layouts show the image on roughly half the viewport. */
export const MEDIA_SIZES = {
  full:  '100vw',
  half:  '(max-width: 768px) 100vw, 50vw',
  third: '(max-width: 768px) 100vw, 33vw',
  quarter: '(max-width: 768px) 50vw, 25vw',
} as const;
