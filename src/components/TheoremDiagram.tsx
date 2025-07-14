import React from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';

interface TheoremDiagramProps {
  theoremId: string;
  practiceId?: number;
}

export default function TheoremDiagram({ theoremId, practiceId }: TheoremDiagramProps) {
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(400, 400).parent(canvasParentRef);
  };

  const drawDottedLine = (p5: p5Types, x1: number, y1: number, x2: number, y2: number, dotLength: number = 5, spacing: number = 5) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = p5.dist(x1, y1, x2, y2);
    const steps = distance / (dotLength + spacing);
    
    for (let i = 0; i < steps; i++) {
      const t1 = i * (dotLength + spacing) / distance;
      const t2 = Math.min(1, (i * (dotLength + spacing) + dotLength) / distance);
      
      const startX = x1 + dx * t1;
      const startY = y1 + dy * t1;
      const endX = x1 + dx * t2;
      const endY = y1 + dy * t2;
      
      p5.line(startX, startY, endX, endY);
    }
  };

  const drawPracticeDiagram = (p5: p5Types, practiceId: number) => {
    switch(practiceId) {
      case 1: // Radius and chord length problem
        p5.background(30);
        p5.stroke(255, 255, 255, 100);
        p5.noFill();
        
        // Draw circle
        p5.circle(200, 200, 300);
        
        // Draw center O
        p5.fill(74, 222, 128);
        p5.noStroke();
        p5.circle(200, 200, 8);
        p5.textSize(16);
        p5.text('O', 210, 195);
        
        // Draw chord AB
        p5.stroke(255);
        p5.line(150, 300, 250, 300);
        
        // Draw perpendicular OM
        p5.stroke(74, 222, 128);
        p5.line(200, 200, 200, 300);
        
        // Draw points A, B, M
        p5.fill(255);
        p5.noStroke();
        p5.circle(150, 300, 8); // A
        p5.circle(250, 300, 8); // B
        p5.circle(200, 300, 8); // M
        
        // Labels
        p5.text('A', 140, 320);
        p5.text('B', 260, 320);
        p5.text('M', 210, 320);
        
        // Measurements
        p5.textSize(14);
        p5.text('6 cm', 210, 250);
        p5.text('5 cm', 170, 315);
        break;

      case 2: // Chord distance problem
        p5.background(30);
        p5.stroke(255, 255, 255, 100);
        p5.noFill();
        
        // Draw circle
        p5.circle(200, 200, 260);
        
        // Draw center O
        p5.fill(74, 222, 128);
        p5.noStroke();
        p5.circle(200, 200, 8);
        p5.textSize(16);
        p5.text('O', 210, 195);
        
        // Draw chord
        p5.stroke(255);
        p5.line(140, 280, 260, 280);
        
        // Draw perpendicular
        p5.stroke(74, 222, 128);
        p5.line(200, 200, 200, 280);
        
        // Labels
        p5.fill(255);
        p5.textSize(14);
        p5.text('13 cm', 220, 240);
        p5.text('24 cm', 190, 295);
        p5.text('h', 185, 240);
        break;

      case 3: // Radius and distance problem
        p5.background(30);
        p5.stroke(255, 255, 255, 100);
        p5.noFill();
        
        // Draw circle
        p5.circle(200, 200, 200);
        
        // Draw center O
        p5.fill(74, 222, 128);
        p5.noStroke();
        p5.circle(200, 200, 8);
        p5.textSize(16);
        p5.text('O', 210, 195);
        
        // Draw chord
        p5.stroke(255);
        p5.line(140, 260, 260, 260);
        
        // Draw perpendicular
        p5.stroke(74, 222, 128);
        p5.line(200, 200, 200, 260);
        
        // Labels
        p5.fill(255);
        p5.textSize(14);
        p5.text('10 cm', 220, 230);
        p5.text('6 cm', 185, 230);
        break;

      case 4: // Two chords problem
        p5.background(30);
        p5.stroke(255, 255, 255, 100);
        p5.noFill();
        
        // Draw circle
        p5.circle(200, 200, 200);
        
        // Draw center O
        p5.fill(74, 222, 128);
        p5.noStroke();
        p5.circle(200, 200, 8);
        p5.textSize(16);
        p5.text('O', 210, 195);
        
        // Draw first chord
        p5.stroke(255);
        p5.line(140, 260, 260, 260);
        
        // Draw second chord
        p5.line(140, 140, 260, 140);
        
        // Draw perpendiculars
        p5.stroke(74, 222, 128);
        p5.line(200, 200, 200, 260);
        p5.line(200, 200, 200, 140);
        
        // Labels
        p5.fill(255);
        p5.textSize(14);
        p5.text('16 cm', 190, 275);
        p5.text('12 cm', 190, 155);
        p5.text('6 cm', 185, 230);
        p5.text('8 cm', 185, 170);
        break;
    }
  };

  const draw = (p5: p5Types) => {
    if (practiceId) {
      drawPracticeDiagram(p5, practiceId);
      return;
    }

    p5.background(30);
    p5.stroke(255, 255, 255, 100);
    p5.noFill();

    if (theoremId === 'theorem-1') {
      // Draw circle
      p5.circle(200, 200, 300);

      // Draw dotted lines OA and OB
      p5.stroke(255, 255, 255, 150);
      drawDottedLine(p5, 200, 200, 100, 300); // OA
      drawDottedLine(p5, 200, 200, 300, 300); // OB

      // Draw center point O
      p5.fill(74, 222, 128); // emerald-500
      p5.noStroke();
      p5.circle(200, 200, 8);
      p5.textSize(16);
      p5.text('O', 210, 195);

      // Draw chord AB
      p5.stroke(255, 255, 255);
      p5.line(100, 300, 300, 300);

      // Draw perpendicular line OM
      p5.stroke(74, 222, 128); // emerald-500
      p5.line(200, 200, 200, 300);

      // Draw points A, B, and M
      p5.fill(255);
      p5.noStroke();
      p5.circle(100, 300, 8); // Point A
      p5.circle(300, 300, 8); // Point B
      p5.circle(200, 300, 8); // Point M

      // Add labels
      p5.textSize(16);
      p5.text('A', 90, 320);
      p5.text('B', 310, 320);
      p5.text('M', 210, 320);

      // Draw right angle marker at M
      p5.stroke(255);
      p5.noFill();
      p5.square(190, 280, 10);
    } 
    else if (theoremId === 'theorem-2') {
      // Draw circle
      p5.circle(200, 200, 300);

      // Draw chord AB
      p5.stroke(255, 255, 255);
      p5.line(100, 300, 300, 300);

      // Draw perpendicular line OM
      p5.stroke(74, 222, 128); // emerald-500
      p5.line(200, 200, 200, 300);

      // Draw radii OA and OB
      p5.stroke(255, 255, 255, 150);
      drawDottedLine(p5, 200, 200, 100, 300); // OA
      drawDottedLine(p5, 200, 200, 300, 300); // OB

      // Draw angle arcs
      p5.noFill();
      p5.stroke(74, 222, 128); // emerald-500
      p5.arc(200, 200, 80, 80, p5.PI/2, p5.PI);
      p5.arc(200, 200, 80, 80, 0, p5.PI/2);

      // Draw points
      p5.fill(74, 222, 128); // emerald-500
      p5.noStroke();
      p5.circle(200, 200, 8); // Point O

      p5.fill(255);
      p5.circle(100, 300, 8); // Point A
      p5.circle(300, 300, 8); // Point B
      p5.circle(200, 300, 8); // Point M

      // Add labels
      p5.textSize(16);
      p5.fill(255);
      p5.text('O', 210, 195);
      p5.text('A', 90, 320);
      p5.text('B', 310, 320);
      p5.text('M', 210, 320);

      // Draw right angle marker
      p5.stroke(255);
      p5.noFill();
      p5.square(190, 280, 10);
    }
    else if (theoremId === 'theorem-3') {
      // Draw circle
      p5.circle(200, 200, 300);

      // Draw two equal chords AB and CD
      p5.stroke(255, 255, 255);
      p5.line(100, 300, 300, 300); // AB
      p5.line(100, 100, 300, 100); // CD

      // Draw perpendicular lines OM and ON
      p5.stroke(74, 222, 128); // emerald-500
      p5.line(200, 200, 200, 300); // OM
      p5.line(200, 200, 200, 100); // ON

      // Draw dotted radii
      p5.stroke(255, 255, 255, 150);
      drawDottedLine(p5, 200, 200, 100, 300); // OA
      drawDottedLine(p5, 200, 200, 300, 300); // OB
      drawDottedLine(p5, 200, 200, 100, 100); // OC
      drawDottedLine(p5, 200, 200, 300, 100); // OD

      // Draw points
      p5.fill(74, 222, 128);
      p5.noStroke();
      p5.circle(200, 200, 8); // Point O

      p5.fill(255);
      p5.circle(100, 300, 8); // Point A
      p5.circle(300, 300, 8); // Point B
      p5.circle(100, 100, 8); // Point C
      p5.circle(300, 100, 8); // Point D
      p5.circle(200, 300, 8); // Point M
      p5.circle(200, 100, 8); // Point N

      // Add labels
      p5.textSize(16);
      p5.fill(255);
      p5.text('O', 210, 195);
      p5.text('A', 90, 320);
      p5.text('B', 310, 320);
      p5.text('C', 90, 90);
      p5.text('D', 310, 90);
      p5.text('M', 210, 320);
      p5.text('N', 210, 90);

      // Draw right angle markers
      p5.stroke(255);
      p5.noFill();
      p5.square(190, 280, 10);
      p5.square(190, 80, 10);
    }
    else if (theoremId === 'theorem-4') {
      // Draw circle
      p5.circle(200, 200, 300);

      // Draw two chords AB and CD
      p5.stroke(255, 255, 255);
      p5.line(100, 300, 300, 300); // AB
      p5.line(100, 100, 300, 100); // CD

      // Draw perpendicular lines OM and ON
      p5.stroke(74, 222, 128); // emerald-500
      p5.line(200, 200, 200, 300); // OM
      p5.line(200, 200, 200, 100); // ON

      // Draw dotted radii
      p5.stroke(255, 255, 255, 150);
      drawDottedLine(p5, 200, 200, 100, 300); // OA
      drawDottedLine(p5, 200, 200, 300, 300); // OB
      drawDottedLine(p5, 200, 200, 100, 100); // OC
      drawDottedLine(p5, 200, 200, 300, 100); // OD

      // Draw points
      p5.fill(74, 222, 128);
      p5.noStroke();
      p5.circle(200, 200, 8); // Point O

      p5.fill(255);
      p5.circle(100, 300, 8); // Point A
      p5.circle(300, 300, 8); // Point B
      p5.circle(100, 100, 8); // Point C
      p5.circle(300, 100, 8); // Point D
      p5.circle(200, 300, 8); // Point M
      p5.circle(200, 100, 8); // Point N

      // Add labels
      p5.textSize(16);
      p5.fill(255);
      p5.text('O', 210, 195);
      p5.text('A', 90, 320);
      p5.text('B', 310, 320);
      p5.text('C', 90, 90);
      p5.text('D', 310, 90);
      p5.text('M', 210, 320);
      p5.text('N', 210, 90);

      // Draw right angle markers
      p5.stroke(255);
      p5.noFill();
      p5.square(190, 280, 10);
      p5.square(190, 80, 10);

      // Add equal distance markers
      p5.stroke(74, 222, 128);
      p5.line(195, 200, 195, 150); // Left marker for ON
      p5.line(205, 200, 205, 150); // Right marker for ON
      p5.line(195, 200, 195, 250); // Left marker for OM
      p5.line(205, 200, 205, 250); // Right marker for OM
    }
    else if (theoremId === 'tan-chord') {
      // Draw circle
      p5.circle(200, 200, 300);

      // Draw tangent line PT
      p5.stroke(255, 255, 255);
      p5.line(100, 100, 200, 200); // PT

      // Draw chord PQ
      p5.line(200, 200, 300, 300); // PQ

      // Draw radius OP
      p5.stroke(74, 222, 128); // emerald-500
      p5.line(200, 200, 200, 200); // OP

      // Draw point R on arc PQ
      p5.fill(255);
      p5.noStroke();
      p5.circle(250, 150, 8); // Point R

      // Draw lines OR and PR
      p5.stroke(255, 255, 255, 150);
      drawDottedLine(p5, 200, 200, 250, 150); // OR
      drawDottedLine(p5, 200, 200, 300, 300); // PQ

      // Draw points
      p5.fill(74, 222, 128);
      p5.noStroke();
      p5.circle(200, 200, 8); // Point O

      p5.fill(255);
      p5.circle(100, 100, 8); // Point T
      p5.circle(300, 300, 8); // Point Q

      // Add labels
      p5.textSize(16);
      p5.fill(255);
      p5.text('O', 210, 195);
      p5.text('P', 190, 220);
      p5.text('T', 90, 90);
      p5.text('Q', 310, 320);
      p5.text('R', 260, 140);

      // Draw angle markers
      p5.stroke(74, 222, 128);
      p5.noFill();
      p5.arc(200, 200, 60, 60, -p5.PI/4, 0); // Angle θ
      p5.arc(200, 200, 80, 80, -p5.PI/2, -p5.PI/4); // Angle α
    }
    else if (theoremId === 'cyclic-quad') {
      // Draw circle
      p5.circle(200, 200, 300);

      // Draw cyclic quadrilateral ABCD
      p5.stroke(255, 255, 255);
      p5.beginShape();
      p5.vertex(100, 100); // A
      p5.vertex(300, 100); // B
      p5.vertex(300, 300); // C
      p5.vertex(100, 300); // D
      p5.endShape(p5.CLOSE);

      // Draw points
      p5.fill(74, 222, 128);
      p5.noStroke();
      p5.circle(200, 200, 8); // Point O

      p5.fill(255);
      p5.circle(100, 100, 8); // Point A
      p5.circle(300, 100, 8); // Point B
      p5.circle(300, 300, 8); // Point C
      p5.circle(100, 300, 8); // Point D

      // Add labels
      p5.textSize(16);
      p5.fill(255);
      p5.text('O', 210, 195);
      p5.text('A', 90, 90);
      p5.text('B', 310, 90);
      p5.text('C', 310, 320);
      p5.text('D', 90, 320);

      // Draw angle markers
      p5.stroke(74, 222, 128);
      p5.noFill();
      p5.arc(100, 100, 60, 60, 0, p5.PI/2); // Angle A
      p5.arc(300, 100, 60, 60, p5.PI/2, p5.PI); // Angle B
      p5.arc(300, 300, 60, 60, p5.PI, 3*p5.PI/2); // Angle C
      p5.arc(100, 300, 60, 60, 3*p5.PI/2, 2*p5.PI); // Angle D
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-900 rounded-lg p-4">
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}