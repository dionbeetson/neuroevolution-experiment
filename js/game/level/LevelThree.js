/**
 * Level 3 = Jumping high blocks and dips together
 */
class LevelThree extends LevelBase {
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

    currentX += this.#sectionWidth;
    sections.push({height: 1, width: this.#sectionWidth, x: currentX, y: (canvas.height-1), fillStyle: this.#colors.section})

    currentX += this.#sectionWidth;
    sections.push({height: 40, width: this.#sectionWidth, x: currentX, y: (canvas.height-40), fillStyle: this.#colors.section})

    currentX += this.#sectionWidth;
    sections.push({height: 40, width: this.#sectionWidth, x: currentX, y: (canvas.height-40), fillStyle: this.#colors.section})

    currentX += this.#sectionWidth;
    sections.push({height: 70, width: this.#sectionWidth, x: currentX, y: (canvas.height-70), fillStyle: this.#colors.section})

    for(let i = 3; i<this.#sectionsCount; i++) {
      currentX += this.#sectionWidth;
      let height = levelBaseline;
      const randomNumber = Math.floor(Math.random() * Math.floor(10));

      if( 9 == randomNumber && sections.length > 3 && 40 == sections[(sections.length-1)].height && 40 == sections[(sections.length-2)].height ) {
        height = 10;
      } else if( randomNumber < 3 ) {
        if( i > 2 && 40 == sections[(sections.length-1)].height && 40 == sections[(sections.length-2)].height && 40 == sections[(sections.length-3)].height ) {
          height = 70;
        }
      }

      sections.push({height: height, width: this.#sectionWidth, x: currentX, y: (canvas.height-height), fillStyle: this.#colors.section})
    }

    return sections;
  };
}
