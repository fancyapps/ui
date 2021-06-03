/**
 *  Deselect any text which may be selected on a page
 */
export const clearTextSelection = () => {
  const selection = window.getSelection ? window.getSelection() : document.selection;

  if (selection && selection.rangeCount && selection.getRangeAt(0).getClientRects().length) {
    if (selection.removeAllRanges) {
      selection.removeAllRanges();
    } else if (selection.empty) {
      selection.empty();
    }
  }
};
