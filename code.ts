figma.showUI(__html__, { width: 380, height: 310 });

figma.ui.onmessage = async (msg) => {
  const nodes = figma.currentPage.selection;

  if (nodes.length === 0) {
    figma.notify("Please select at least one node.");
    return;
  }

  if (msg.type === 'add-text-watermark') {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    for (const node of nodes) {
      if ("appendChild" in node) {
        const text = figma.createText();
        text.characters = msg.text || "WATERMARK";
        text.fontSize = Number(msg.size) || 48;
        text.x = Number(msg.x) || 20;
        text.y = Number(msg.y) || 20;
        text.opacity = (Number(msg.opacity) || 50) / 100;

        // Применяем цвет
        if (msg.color) {
          const hex = msg.color.replace(/^#/, "");
          const bigint = parseInt(hex, 16);
          const r = ((bigint >> 16) & 255) / 255;
          const g = ((bigint >> 8) & 255) / 255;
          const b = (bigint & 255) / 255;
          text.fills = [{ type: 'SOLID', color: { r, g, b } }];
        }

        node.appendChild(text);
      }
    }

    figma.notify("Text watermark added successfully!");
    figma.closePlugin();
  }

  if (msg.type === 'add-image-watermark') {
    for (const node of nodes) {
      if ("appendChild" in node) {
        try {
          const image = figma.createImage(new Uint8Array(msg.imageBytes));
          const rect = figma.createRectangle();
          rect.resize(Number(msg.width), Number(msg.height));
          rect.fills = [{
            type: "IMAGE",
            scaleMode: "FILL",
            imageHash: image.hash
          }];
          rect.x = Number(msg.x) || 0;
          rect.y = Number(msg.y) || 0;
          rect.opacity = (Number(msg.opacity) || 20) / 100;

          node.appendChild(rect);
        } catch (error) {
          figma.notify("Error adding image watermark: " + (error instanceof Error ? error.message : "Unknown error"));
        }
      }
    }

    figma.notify("Image watermark added successfully!");
    figma.closePlugin();
  }
};
