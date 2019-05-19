/**
 * A class to plot the neuroevolution success
 */
class NeuroEvolutionChart {
  constructor() {
    this.chart = null;
    this.config = {
  		type: 'line',
  		data: {
  			labels: [],
  			datasets: [{
  				label: '',
  				backgroundColor: '#999999',
  				borderColor: '#EEEEEE',
          borderWidth: 3,
  				data: [],
  				fill: false,
  			},{
  				label: '',
  				backgroundColor: '#91C7B1',
  				borderColor: '#A1CFBC',
          borderWidth: 2,
  				data: [],
  				fill: false,
  			}]
  		},
  		options: {
  			responsive: true,
  			title: {
  				display: false
  			},
  			tooltips: {
  				mode: 'index',
  				intersect: false,
  			},
        legend: {
          display: false
        },
  			hover: {
  				mode: 'nearest',
  				intersect: true
  			},
  			scales: {
  				xAxes: [{
  					display: false,
  					scaleLabel: {
  						display: true,
  						labelString: 'Round'
  					}
  				}],
  				yAxes: [{
  					display: true,
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 100
            },
  					scaleLabel: {
  						display: false,
  						labelString: 'Progress'
  					}
  				},{
  					display: true,
            position: 'right',
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 200
            },
  					scaleLabel: {
  						display: false,
  						labelString: 'Score'
  					}
  				}]
  			}
  		}
  	};

    this.setup();
  }

  setup(){
    var ctx = document.getElementById('trend').getContext('2d');
    this.chart = new Chart(ctx, this.config);
  }

  update(progress, score) {
    // Purge middle data (to avoid clutter)
    if( this.config.data.labels.length > 12 ) {
      this.config.data.labels.splice(1, 1);
      this.config.data.datasets[0].data.splice(1, 1);
      this.config.data.datasets[1].data.splice(1, 1);
    }

    this.config.data.labels.push((this.config.data.labels.length+1))
    this.config.data.datasets[0].data.push(progress);
    this.config.data.datasets[1].data.push(score);

    this.chart.update();
  }
}
