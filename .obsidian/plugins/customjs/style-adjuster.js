class StyleAdjuster {
  static canvas = document.createElement('canvas');

  async invoke() {
    await cJS();

    await this.adjustQuoteStyle();

    await this.adjustListLinePadding();
  }

  // calculates and sets the indent that '>' usually takes up in quote blocks
  async adjustQuoteStyle() {
    const measureSpan = document.createElement('span');
    measureSpan.className = 'cm-transparent';
    measureSpan.textContent = '>';

    const container = document.createElement('div');
    container.className = 'HyperMD-quote';
    container.style.position = 'absolute';
    container.style.opacity = '0';
    container.appendChild(measureSpan);

    document.body.appendChild(container);

    const style = getComputedStyle(measureSpan);
    const fontStr = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const quoteCharWidth = this.getTextWidth('>', fontStr) - 1;

    document.body.removeChild(container);

    const styleTagQuote = document.createElement('style');
    styleTagQuote.id = 'quote-padding-override';
    styleTagQuote.textContent = `
      :root {
        --transparent-span-width: ${quoteCharWidth}px !important;
      }
    `;

    const existingQuotePaddingOverride = document.getElementById('quote-padding-override');
    if (existingQuotePaddingOverride) existingQuotePaddingOverride.remove();

    document.head.appendChild(styleTagQuote);
  }

  // removes bottom padding on nested list-line elements (up to 30 nested lists)
  async adjustListLinePadding() {
    const styleTagList = document.createElement('style');
    styleTagList.id = 'list-line-padding-override';

    // Generate CSS rules for levels 1-29
    let cssRules = '';
    for (let i = 1; i < 30; i++) {
      cssRules += `
        .HyperMD-list-line-${i}:not(.HyperMD-list-line-nobullet):has(+ .HyperMD-list-line-${i + 1}) {
          padding-bottom: 0 !important;
        }
      `;
    }

    styleTagList.textContent = cssRules;

    // Remove existing if present
    const existingListPaddingOverride = document.getElementById('list-line-padding-override');
    if (existingListPaddingOverride) existingListPaddingOverride.remove();

    document.head.appendChild(styleTagList);
  }

  getTextWidth(text, font) {
    const context = StyleAdjuster.canvas.getContext("2d");
    context.font = font;
    return context.measureText(text).width;
  }
}