/*
 * This script is used to assist in making the editor block quote look the same as in the reader.
 * The editor blockquote contains a '>' symbol. The width of this needs to be accoutned for, so
 * this is calculated here and set to --transparent-span-width, which is used in set-editor-style-to-reader.css
*/

class QuoteStyleAdjuster {

  async invoke() {

    await cJS();
    
    // Create measurement element
    const measureSpan = document.createElement('span');
    measureSpan.className = 'cm-transparent';
    measureSpan.textContent = '>';
    
    // Create container to inherit proper styles
    const container = document.createElement('div');
    container.className = 'HyperMD-quote';
    container.style.position = 'absolute';
    container.style.opacity = '0';
    container.appendChild(measureSpan);

    // Add to DOM temporarily
    document.body.appendChild(container);
      
    // Get computed styles
    const style = getComputedStyle(measureSpan);
    const fontStr = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const charWidth = this.getTextWidth('>', fontStr);
    
    // Clean up
    document.body.removeChild(container);

    // Set global CSS variable
    const styleTag = document.createElement('style');
    styleTag.id = 'quote-padding-override';
    styleTag.textContent = `
        .HyperMD-quote {
            --transparent-span-width: ${charWidth}px !important;
        }
    `;

    // Remove existing if present
    const existing = document.getElementById('quote-padding-override');
    if (existing) existing.remove();
    
    document.head.appendChild(styleTag);
  }

  /**
    * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
    * 
    * @param {String} text The text to be rendered.
    * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
    * 
    * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
  */
  getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }

}
