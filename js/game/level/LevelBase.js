/**
 * Base Level that all levels inherit from
 */
class LevelBase {
  #sections = []
  #sectionWidth = 40;
  #levelBaseline = 40;
  #lastSectionHeight = this.levelBaseline;
  #colors = {
    section: '#A1CFBC',
    sectionActive: '#A1CFBC',
    sectionLookAheadHighlight: '#E3D081',
    sectionCollide: '#B33951'
  };

  setup(canvas, sections) {
    if ( sections.length > 0 ) {
      this.#sections = sections;
      return sections;
    }

    let currentX = 0;
    for(var x=0; x<canvas.width; x += this.#sectionWidth ) {
      currentX = x;
      this.#sections.push({height: this.#levelBaseline, width: this.#sectionWidth, x: x, y: (canvas.height-this.#levelBaseline),fillStyle: this.#colors.section});
    }

    let levelSections = this.generateSections(currentX, canvas, this.#levelBaseline);
    for(var i=0; i<levelSections.length; i++ ) {
      currentX += levelSections[i].width;
      this.#sections.push(levelSections[i]);
    }

    // Add end flag
    currentX += this.#sectionWidth;
    this.#sections.push({height: 120, width: 6, x: currentX, y: 0, end: true, fillStyle: this.#colors.section});
    currentX += 6;

    this.#sections.push({height: this.#levelBaseline, width: this.#sectionWidth, x: currentX, y:(canvas.height-this.#levelBaseline) ,fillStyle: this.#colors.section});
  };

  draw(ctx) {
    ctx.rect(0, 0, 500, 500);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    for(var i=0; i<this.#sections.length; i++) {
      ctx.beginPath();
      ctx.globalAlpha = 0.4;

      ctx.rect(this.#sections[i].x, this.#sections[i].y, this.#sections[i].width, this.#sections[i].height);
      ctx.fillStyle = this.#sections[i].fillStyle;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.closePath();
    }
  }

  get levelBaseline(){
    return this.#levelBaseline;
  }

  get sections(){
    return this.#sections;
  }

  set sections(sections){
    this.#sections = sections;
  }

  get colors(){
    return this.#colors;
  }

  get lastSectionHeight(){
    return this.#lastSectionHeight;
  }

  set lastSectionHeight( lastSectionHeight ){
    this.#lastSectionHeight = lastSectionHeight;
  }
}
