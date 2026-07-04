/**
 * Swimming program master switch.
 *
 * Coach Abdullah's online swimming coaching is PAUSED. While paused:
 *  • the Swimmers Bundle is removed from pricing (not shown, not sellable)
 *  • the swim sub-admin key is disabled
 *
 * Kept (intentionally): the "Swimmers on the podium" photo gallery on the
 * landing page — those are Coach Omda's own results and stay live.
 *
 * ── TO RESTORE EVERYTHING: set SWIMMING_PAUSED = false and redeploy. ──
 * The bundle definitions, swim admin key and all swim code are untouched, so
 * flipping this single flag brings the whole swimming program back.
 */
export const SWIMMING_PAUSED = true;
