/**
 * Level 2 = Jumping dips only
 */
class LevelTwo extends LevelBase {
  #sectionsCount = 100;
  #sectionWidth = 40;
  #colors = {
    section: '#A1CFBC',
    sectionActive: '#91C7B1',
    sectionLookAheadHighlight: '#E3D081',
    sectionCollide: '#B33951'
  };

  generateSections(currentX, canvas, levelBaseline) {
    let sections = [];

    for(var i=0; i<this.#sectionsCount; i++) {
      currentX += this.#sectionWidth;
      let height = levelBaseline;

      if( Math.floor(Math.random() * Math.floor(10)) < 3 ) {
        if( i > 2 && 40 == sections[(sections.length-1)].height && 40 == sections[(sections.length-2)].height ) {
          height = 10;
        }
      }

      sections.push({height: height, width: this.#sectionWidth, x: currentX, y: (canvas.height-height), fillStyle: this.#colors.section})
    }

    return sections;
  };
}
