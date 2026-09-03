/** The one entrance contract shared by the pre-paint bootstrap and runtime controller. */
export const PRINT_MOTION_ENTRANCE_SELECTOR = [
   '.project-opening',
   '.showcase-lead',
   '.showcase-library',
   '.showcase-mapping',
   '.showcase-archive',
   '.tool-entry',
   '.workshop-feature',
   '.permission-print',
   '.blog-opening',
   '.blog-post-header',
   '.commission-index__sheet',
   '.commission-hero__photo',
   '.commission-hero__paper',
   '.estimator-header',
   '.error-print',
   '.print-heading',
   '.blog-post-content',
   '.blog-archive',
   '.commission-section',
   '.project-section',
   '.showcase-project',
   '.estimator-page > div',
   '.project-opening > header .print-heading',
   '.blog-opening__title',
   '.blog-post-title',
   '.commission-index__copy > header > h2',
   '.commission-hero__paper .commission-banner',
   '.estimator-header > h2',
   '.error-print > h1',
].join(', ');

export const PRINT_MOTION_BOOT_TIMEOUT = 1_500;

/** Returns only outer entrance plates so nested content is never clipped twice. */
export const getPrintMotionTargets = (root: ParentNode = document) => {
   const targets = Array.from(root.querySelectorAll<HTMLElement>(PRINT_MOTION_ENTRANCE_SELECTOR));
   return targets.filter(
      (target) => !targets.some((parent) => parent !== target && parent.contains(target)),
   );
};
