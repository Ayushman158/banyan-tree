const fs = require('fs');
let content = fs.readFileSync('./src/TreeScene3D.jsx', 'utf8');

const target1 = `const ROOT_LAYOUTS = {
  "chronic-stress": { x: 30, y: 78, labelX: 30, labelY: 82, align: "center", side: "bottom" },
  "nervous-system": { x: 40, y: 81, labelX: 40, labelY: 85, align: "center", side: "bottom" },
  "emotional": { x: 50, y: 83, labelX: 50, labelY: 87, align: "center", side: "bottom" },
  "sleep": { x: 60, y: 80, labelX: 60, labelY: 84, align: "center", side: "bottom" },
  "trauma": { x: 70, y: 79, labelX: 70, labelY: 83, align: "center", side: "bottom" },
  "nutrition": { x: 65, y: 48, labelX: 68, labelY: 48, align: "left", side: "right" },
  "lifestyle": { x: 65, y: 60, labelX: 68, labelY: 60, align: "left", side: "right" }
};`;
const replace1 = `const ROOT_LAYOUTS = {
  "gut-dysfunction": { x: 25, y: 78, labelX: 25, labelY: 82, align: "center", side: "bottom" },
  "environmental-toxins": { x: 35, y: 81, labelX: 35, labelY: 85, align: "center", side: "bottom" },
  "nutrients-deficiency": { x: 45, y: 83, labelX: 45, labelY: 87, align: "center", side: "bottom" },
  "hormonal-imbalance": { x: 55, y: 83, labelX: 55, labelY: 87, align: "center", side: "bottom" },
  "mitochondrial-dysfunction": { x: 65, y: 81, labelX: 65, labelY: 85, align: "center", side: "bottom" },
  "dosha-imbalance": { x: 75, y: 78, labelX: 75, labelY: 82, align: "center", side: "bottom" },
  "hidden-infections": { x: 65, y: 48, labelX: 68, labelY: 48, align: "left", side: "right" },
  "chronic-stress": { x: 65, y: 60, labelX: 68, labelY: 60, align: "left", side: "right" },
  "poor-sleep": { x: 35, y: 48, labelX: 32, labelY: 48, align: "right", side: "left" },
  "inflammation": { x: 35, y: 60, labelX: 32, labelY: 60, align: "right", side: "left" },
  "poor-detoxification": { x: 30, y: 70, labelX: 27, labelY: 70, align: "right", side: "left" }
};`;
content = content.replace(target1, replace1);

const target2 = `  const mobilePositions = {
    // Row 1: Upper roots (symmetrical at 28% from center)
    "nutrition":      { x: 22, y: 32 },
    "nervous-system": { x: 50, y: 30 },
    "sleep":          { x: 78, y: 32 },
    // Row 2: Mid-level roots (symmetrical at 22% from center)
    "lifestyle":      { x: 28, y: 48 },
    "chronic-stress": { x: 72, y: 48 },
    // Row 3: Deep roots (symmetrical at 30% from center, safely inside screen edges)
    "emotional":      { x: 20, y: 64 },
    "trauma":         { x: 80, y: 64 },
  };`;
const replace2 = `  const mobilePositions = {
    "gut-dysfunction":      { x: 22, y: 32 },
    "hormonal-imbalance":   { x: 50, y: 30 },
    "poor-sleep":           { x: 78, y: 32 },
    "environmental-toxins": { x: 35, y: 40 },
    "hidden-infections":    { x: 65, y: 40 },
    "nutrients-deficiency": { x: 20, y: 50 },
    "mitochondrial-dysfunction": { x: 50, y: 50 },
    "chronic-stress":       { x: 80, y: 50 },
    "dosha-imbalance":      { x: 22, y: 64 },
    "inflammation":         { x: 50, y: 62 },
    "poor-detoxification":  { x: 78, y: 64 },
  };`;
content = content.replace(target2, replace2);

const target3 = `const getRootLabelStyle = (id, layout, isMobile) => {
  const isRightSide = layout.side === 'right';
  const systemicIndex = ["chronic-stress", "nervous-system", "emotional", "sleep", "trauma"].indexOf(id);
  const isEven = systemicIndex % 2 === 0;
  
  if (!isMobile) {
    const labelTransform = isRightSide 
      ? 'translate(0%, -50%)' 
      : (isEven ? 'translate(-50%, 15px)' : 'translate(-50%, -48px)');
    return {
      left: isRightSide ? '20px' : '0px',
      transform: labelTransform,
      textAlign: isRightSide ? 'left' : 'center',
    };
  }`;
const replace3 = `const getRootLabelStyle = (id, layout, isMobile) => {
  const isRightSide = layout.side === 'right';
  const isLeftSide = layout.side === 'left';
  const systemicIndex = ["gut-dysfunction", "environmental-toxins", "nutrients-deficiency", "hormonal-imbalance", "mitochondrial-dysfunction", "dosha-imbalance"].indexOf(id);
  const isEven = systemicIndex % 2 === 0;
  
  if (!isMobile) {
    let labelTransform;
    let left;
    let textAlign;

    if (isRightSide) {
      labelTransform = 'translate(0%, -50%)';
      left = '20px';
      textAlign = 'left';
    } else if (isLeftSide) {
      labelTransform = 'translate(-100%, -50%)';
      left = '-20px';
      textAlign = 'right';
    } else {
      labelTransform = isEven ? 'translate(-50%, 15px)' : 'translate(-50%, -48px)';
      left = '0px';
      textAlign = 'center';
    }

    return {
      left,
      transform: labelTransform,
      textAlign,
    };
  }`;
content = content.replace(target3, replace3);

const target4 = `  const below = id === 'nervous-system';`;
const replace4 = `  const below = id === 'hormonal-imbalance' || id === 'mitochondrial-dysfunction' || id === 'inflammation';`;
content = content.replace(target4, replace4);

const target5 = `  if (directRoot === 'nutrition' || directRoot === 'lifestyle') {
    active.add('chronic-stress');
    active.add('sleep');
    active.add('nervous-system');
  } else {
    active.add('nervous-system');
    active.add('sleep');
  }`;
const replace5 = `  active.add('chronic-stress');
  active.add('poor-sleep');
  active.add('inflammation');`;
content = content.replace(target5, replace5);

const target6 = `    if (id === 'nervous-system') {`;
const replace6 = `    if (id === 'hormonal-imbalance') {`;
content = content.replace(target6, replace6);

const target7 = `  if (layout.side === 'bottom') {
    return \`M \${layout.x} \${layout.y} C \${layout.x} \${layout.y - 12}, \${jx} \${jy + 15}, \${jx} \${jy}\`;
  } else {
    return \`M \${jx} \${jy} C \${jx + 12} \${jy}, \${layout.x - 10} \${layout.y}, \${layout.x} \${layout.y}\`;
  }`;
const replace7 = `  if (layout.side === 'bottom') {
    return \`M \${layout.x} \${layout.y} C \${layout.x} \${layout.y - 12}, \${jx} \${jy + 15}, \${jx} \${jy}\`;
  } else if (layout.side === 'right') {
    return \`M \${jx} \${jy} C \${jx + 12} \${jy}, \${layout.x - 10} \${layout.y}, \${layout.x} \${layout.y}\`;
  } else if (layout.side === 'left') {
    return \`M \${jx} \${jy} C \${jx - 12} \${jy}, \${layout.x + 10} \${layout.y}, \${layout.x} \${layout.y}\`;
  }`;
content = content.replace(target7, replace7);


fs.writeFileSync('./src/TreeScene3D.jsx', content);
console.log('TreeScene3D.jsx updated');
