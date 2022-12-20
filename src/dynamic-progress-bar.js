var __progress_observer__ = [];

var __observers__ = [];
// Progress class uses ResizeObserver for the dynamic height of the progress bar
// ResizeObserver is not supported in IE11
// https://caniuse.com/#search=resizeobserver
// https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver

class Progress {
    //default options for progress bar
    constructor(elementId, options = default_config, progressBarDetails = default_barDetails) {
        this.id = elementId
        this.options = { ...options }
        this.__default__ = { ...options }
        this.barDetails = progressBarDetails
        if (progressBarDetails.barsList.length > 0) {
            this.options.barContainer.totalBars = progressBarDetails.barsList.length
        }

        __progress_observer__.push(this)

    }

    static runObserver(entries) {
        // console.log("running")
        entries.forEach(element => {
            // console.log(element.target)
            try {
                const observerStatus = element.target.getAttribute('__oveserver_enabled__')
                if (observerStatus === 'true') {
                    Progress.getParentHeight(element.target.getAttribute('id'))
                }
            } catch (error) {

            }

        });
    }

    createProgressBar() {
        const parent = document.getElementById(this.id)

        let progress_bar_container = document.createElement('div');
        progress_bar_container.classList.add('progress-bar-container');
        progress_bar_container.setAttribute('id', '$$' + this.id);

        progress_bar_container.style.setProperty('--grid-lines', this.options.grid.totalLines);
        progress_bar_container.style.setProperty('--total-progress-bars', this.options.barContainer.totalBars);
        progress_bar_container.style.setProperty('--animate-cont-margin', this.options.bar.margin.top);
        progress_bar_container.style.setProperty('--progress-bar-height', this.options.bar.height);


        let gridLinesCont = document.createElement('div');
        gridLinesCont.classList.add("grid-lines-container");
        for (let i = 0; i < this.options.grid.totalLines; i++) {
            let gridLine = document.createElement("div")
            gridLine.classList.add("grid-line");
            gridLine.style.setProperty("border-color", this.options.grid.lineColor);
            gridLine.style.setProperty("opacity", this.options.grid.opacity);
            gridLine.style.setProperty("--circle-color", this.options.grid.circleColor);
            let spanBlock = document.createElement("span");
            spanBlock.style.setProperty("color", this.options.grid.lineLabel.color);
            spanBlock.style.setProperty("font-weight", this.options.grid.lineLabel.fontWeight);
            spanBlock.style.setProperty("font-size", this.options.grid.lineLabel.fontSize);
            spanBlock.innerHTML = this.options.grid.lineLabel.text(i);
            gridLine.appendChild(spanBlock);
            gridLinesCont.appendChild(gridLine);

        }

        progress_bar_container.appendChild(gridLinesCont);


        let progress_bars = document.createElement('div');
        progress_bars.classList.add('progress-container');

        const bars = (() => {
            if (this.barDetails.barsList.length === 1 && this.barDetails.barsList[0].id === 'default_bar_id') {
                return [...Array(this.options.barContainer.totalBars).keys()];
            } else {
                return this.barDetails.barsList
            }
        })()

        for (let i = 0; i < bars.length; i++) {

            let bar_info;
            if (typeof (bars[i]) === 'object') {
                bar_info = { ...bars[i] }
            } else {
                bar_info = { ...default_barDetails.barsList[0] }
                bar_info.id = bar_info.id + (i + 1)
                bar_info.order = i + 1;
                bar_info.label = bar_info.label + (i + 1);

                const steps = [...Array(this.options.grid.totalLines).keys()];
                bar_info.progress = steps[Math.floor(Math.random() * steps.length)];
                // bar_info.progress = 0;
            }


            let animateCont = document.createElement('div');
            animateCont.classList.add('animate-cont');
            animateCont.setAttribute('id', '$bar-' + bar_info.id);
            animateCont.setAttribute('style', '--order:' + bar_info.order);

            let progressBar = document.createElement('div');
            progressBar.classList.add('progress-bar');
            const bar_percentage = bar_info.progress / this.options.grid.totalLines * 100
            progressBar.setAttribute('id', '$progress-bar-' + bar_info.id);
            progressBar.style.setProperty('--data-percentage', bar_percentage);
            progressBar.style.setProperty('--progress-bar-gap', this.options.bar.progressBar.margin);
            progressBar.style.setProperty('--progress-bar-color', bar_info.barColor ? bar_info.barColor : this.options.bar.progressBar.color);

            progressBar.setAttribute('playerName', 'Player ' + (i + 1));


            let bar = document.createElement('div');
            bar.classList.add('progress');
            bar.setAttribute('label', bar_info.label);
            bar.setAttribute('totalTime', this.options.bar.rightLabelText(bar_info, this.barDetails.barsList, this.options.grid.totalLines));

            let bar_animation = document.createElement('div');
            bar_animation.classList.add('bar-animation');


            // pending



            bar.appendChild(bar_animation);

            progressBar.appendChild(bar);

            let bar_name = document.createElement('div');
            bar_name.classList.add('bar-name');
            bar_name.appendChild(document.createTextNode(bar_info.barName));
            bar_name.style.setProperty('--bar-name-color', bar_info.barNameColor);
            bar_name.style.setProperty('--align', bar_info.barNameAlign);

            progressBar.appendChild(bar_name);

            animateCont.appendChild(progressBar);
            progress_bars.appendChild(animateCont);

        }

        progress_bar_container.appendChild(progress_bars);

        // <div class="animate-cont" id="1" style="--order:2">
        //     <div class="progress-bar" id="student-1" style="--data-percentage:0" playerName="" label="2😜"
        //         totalTime="🏁 00:00:00">
        //         <div class="progress"></div>
        //     </div>
        // </div>


        // return progress_bar;
        parent.innerHTML = "";
        parent.appendChild(progress_bar_container);


        this.registerObserver();
    }

    // Register Observer for responsiveness in height. (width is set to be auto).
    registerObserver() {
        if (this.options.observer.status && this.options.observer.__observer__ === null) {
            const parent = document.getElementById(this.id);
            const resize_observe = new ResizeObserver(Progress.runObserver);
            resize_observe.observe(parent)
            __observers__.push({ "id": this.id, "observer": resize_observe });
            this.options.observer.__observer__ = resize_observe;
            parent.setAttribute('__oveserver_enabled__', 'true');
            // console.log(this.options.observer);
        }
    }

    // deregister observer (if you don't want reponsiveness in height)
    deregisterOberserver() {
        if (this.options.observer.status) {
            this.options.observer.__observer__.disconnect();
            this.options.observer.__observer__ = null;
            const index = __observers__.findIndex(observer => observer.id === this.id);
            __observers__.splice(index, 1);
            parent.setAttribute('__oveserver_enabled__', 'false');
        }
    }


    static getParentHeight(id) {
        const parent = document.getElementById(id);
        const h = getComputedStyle(parent).getPropertyValue('height');

        const height = parseInt(h.replace('px', ''));
        const responsiveHeight = height

        // console.log(responsiveHeight)

        const progressObj = Progress.getPeogressObject(id);

        // console.log(responsiveHeight < progressObj.containerHeight())

        if (responsiveHeight < progressObj.containerHeight()) {
            const eachBarHeight = (responsiveHeight - 35) / progressObj.options.barContainer.totalBars
            const estimatedAnimateContMargin = parseInt(eachBarHeight * 0.42 / 2)
            const estimatedProgressBarHeight = parseInt(eachBarHeight * 0.58)

            if (estimatedAnimateContMargin < 10) {
                progressObj.options.bar.height = estimatedProgressBarHeight
                progressObj.options.bar.margin.top = estimatedAnimateContMargin
                progressObj.options.bar.margin.bottom = estimatedAnimateContMargin
                progress_bar.updateHeight()
            }
        }

    }


    static getPeogressObject(id) {
        // get object from an array __progress_observer__ by id
        const progress_observer_index = __progress_observer__.findIndex(x => x.id === id);
        if (progress_observer_index === -1) {
            return null;
        }

        return __progress_observer__[progress_observer_index];
    }

    updateHeight() {
        const progress_bar_container = document.getElementById('$$' + this.id);
        progress_bar_container.style.setProperty('--grid-lines', this.options.grid.totalLines);
        progress_bar_container.style.setProperty('--total-progress-bars', this.options.barContainer.totalBars);
        progress_bar_container.style.setProperty('--animate-cont-margin', this.options.bar.margin.top);
        progress_bar_container.style.setProperty('--progress-bar-height', this.options.bar.height);

    }

    containerHeight() {
        let bar_with_m_h = this.options.bar.height + this.options.bar.margin.top * 2 + 35
        return bar_with_m_h * this.options.barContainer.totalBars;
    }

    // test mode function
    startRandomProgress() {
        // It is a test utility function
        let bars = this.barDetails.barsList
        for (let i = 0; i < bars.length; i++) {
            let bar_info = bars[i]
            const steps = [...Array(this.options.grid.totalLines).keys()];
            const random_step = steps[Math.floor(Math.random() * steps.length)];
            bar_info.progress = random_step + 1
        }

        bars.sort((a, b) => b.progress - a.progress)
        bars.forEach((bar, index) => {
            bar.order = index + 1
        });
        this.updateProgressBars();


    }


    updateProgressBars() {
        let bars = this.barDetails.barsList
        bars.forEach((bar, index) => {
            const _bar_order = document.getElementById('$bar-' + bar.id);
            _bar_order.setAttribute('style', '--order:' + bar.order);
            const bar_percentage = bar.progress / this.options.grid.totalLines * 100

            _bar_order.children[0].style.setProperty('--data-percentage', bar_percentage);
            _bar_order.children[0].style.setProperty('--progress-bar-color', bar.barColor ? bar.barColor : this.options.bar.progressBar.color);

            _bar_order.children[0].children[0].setAttribute('label', bar.label);
            _bar_order.children[0].children[0].setAttribute('totalTime', this.options.bar.rightLabelText(bar, this.barDetails.barsList, this.options.grid.totalLines));
            // console.log()

            let bar_animation = _bar_order.children[0].children[0].children[0]
            // step labels/ time labels/ percentage labels
            const steps = ['02:00', '05:29', '4', 5, 7, 7]
            // only show lables after the start postion
            if (bar.progress > 1) {
                console.log(bar.progress)
                // dont show labels for the last bar step label
                let last = steps.length >= bar.progress ? bar.progress - 1 : steps.length;
                for (let j = 0; j < last; j++) {
                    let step_label = document.createElement('div');
                    step_label.classList.add('bar_step_label');
                    step_label.innerHTML = steps[j] || ''
                    // let scaled_value = 100 / bar.bar_percentage * ((j + 1) / this.options.grid.totalLines * 100)
                    let scaled_value = 100 * (j + 1) / bar.progress
                    step_label.setAttribute('style', `--step-label-position: ${scaled_value};--step-label-color:${this.options.bar.stepLabel.color};--step-label-font-size:${this.options.bar.stepLabel.fontSize}`);
                    bar_animation.appendChild(step_label);
                }
            }
        });
    }

    get currentGridLines() {
        const lines = document.querySelectorAll('#' + this.id + ' .grid-line')
        return lines.length
    }

    updateGridLineNumbers() {
        // gridLinesCont.classList.add("grid-lines-container");

        const progress_bar_container = document.querySelector('#' + this.id + ' .progress-bar-container');
        progress_bar_container.style.setProperty('--grid-lines', this.options.grid.totalLines);

        const gridLinesCont = document.querySelector('#' + this.id + ' .grid-lines-container')

        let currentGridLines = this.currentGridLines

        while (this.options.grid.totalLines > currentGridLines) {
            // add line or add node element
            let gridLine = document.createElement('div');
            gridLine.classList.add('grid-line');
            gridLine.style.setProperty("border-color", this.options.grid.lineColor);
            gridLine.style.setProperty("opacity", '0');
            gridLine.style.setProperty("--circle-color", this.options.grid.circleColor);
            let spanBlock = document.createElement('span');
            spanBlock.style.setProperty("color", this.options.grid.lineLabel.color);
            spanBlock.style.setProperty("font-weight", this.options.grid.lineLabel.fontWeight);
            spanBlock.style.setProperty("font-size", this.options.grid.lineLabel.fontSize);
            spanBlock.innerHTML = this.options.grid.lineLabel.text(currentGridLines);

            gridLine.appendChild(spanBlock);

            gridLinesCont.appendChild(gridLine);

            currentGridLines++;

            setTimeout(() => {
                gridLine.style.setProperty('position', 'relative');
                gridLine.style.setProperty('opacity', this.options.grid.opacity);
            }, 10)
        }

        let removing_lines = []
        var allGridLines = document.querySelectorAll('#' + this.id + ' .grid-line');
        allGridLines = Array.from(allGridLines)
        allGridLines = allGridLines.reverse()
        if (this.options.grid.totalLines !== currentGridLines) {
            allGridLines.forEach(gridLine => {
                gridLine.style.setProperty('opacity', '0');
            })
        }
        while (this.options.grid.totalLines < currentGridLines) {
            // remove line or remove node element
            if (allGridLines.length > 0) {
                const gridLine = allGridLines[currentGridLines - this.options.grid.totalLines - 1];
                // gridLine.style.setProperty('width', '0%');
                // gridLine.style.setProperty('opacity', '0');
                removing_lines.push(gridLine)
                currentGridLines--;
            }
        }
        if (removing_lines.length > 0) {

            setTimeout(() => {
                removing_lines.forEach(gridLine => {
                    gridLine.parentNode.removeChild(gridLine)
                })

                allGridLines.forEach(gridLine => {
                    gridLine.style.setProperty('opacity', '1');
                })
            }, 1000)
        }

        this.updateProgressBars();
    }


    updateGridLabel() {
        // const gridLinesCont = document.querySelector('#' + this.id + ' .grid-lines-container')
        const allGridLines = document.querySelectorAll('#' + this.id + ' .grid-line')
        allGridLines.forEach((gridLine, index) => {
            gridLine.querySelector('span').innerHTML = this.options.grid.lineLabel.text(index)
        })
    }


    updateGridLineProperties() {
        // update grid lines style
        const allGridLines = document.querySelectorAll('#' + this.id + ' .grid-line')
        allGridLines.forEach((gridLine, index) => {
            gridLine.style.setProperty("border-color", this.options.grid.lineColor);
            gridLine.style.setProperty("opacity", this.options.grid.opacity);
            gridLine.style.setProperty("--circle-color", this.options.grid.circleColor);
        })
    }


    updateGrid() {
        // It updates the grid lines and the grid labels and all the grid properties
        this.updateGridLineNumbers();
        this.updateGridLabel();
        this.updateGridLineProperties();
    }


    update() {
        // It updates all the grid elements
        this.updateGrid();
        this.updateProgressBars();
    }

    set setOptions(options) {
        // this.options = { ...this.options, ...options }

        // update values of options variable using options parameter

        // check defined in below assignment

        if ('bar' in options) {
            this.options.bar.color = options.bar.color || this.options.bar.color;
            this.options.bar.backgroundColor = options.bar.backgroundColor || this.options.bar.backgroundColor;
        }


        if ('grid' in options) {
            if ('lineLabel' in options.grid) {

                this.options.grid.lineLabel.text = options.grid.lineLabel.text || this.options.grid.lineLabel.text;
                this.options.grid.lineLabel.color = options.grid.lineLabel.color || this.options.grid.lineLabel.color;
                this.options.grid.lineLabel.fontSize = options.grid.lineLabel.fontSize || this.options.grid.lineLabel.fontSize;
                this.options.grid.lineLabel.fontWeight = options.grid.lineLabel.fontWeight || this.options.grid.lineLabel.fontWeight;

                if ('margin' in options.grid) {
                    this.options.grid.lineLabel.margin.top = options.grid.lineLabel.margin.top || this.options.grid.lineLabel.margin.top;
                    this.options.grid.lineLabel.margin.right = options.grid.lineLabel.margin.right || this.options.grid.lineLabel.margin.right;
                    this.options.grid.lineLabel.margin.left = options.grid.lineLabel.margin.left || this.options.grid.lineLabel.margin.left;
                    this.options.grid.lineLabel.margin.bottom = options.grid.lineLabel.margin.bottom || this.options.grid.lineLabel.margin.bottom;
                }
                // for future modifications it is not used yet but it will be used in the future ( 17/03/2022 )
                this.options.grid.lineLabel.fontFamily = options.grid.lineLabel.fontFamily || this.options.grid.lineLabel.fontFamily;
                this.options.grid.lineLabel.fontStyle = options.grid.lineLabel.fontStyle || this.options.grid.lineLabel.fontStyle;
                this.options.grid.lineLabel.textAlign = options.grid.lineLabel.textAlign || this.options.grid.lineLabel.textAlign;
            }

            this.options.grid.totalLines = options.grid.totalLines || this.options.grid.totalLines;
            this.options.grid.lineColor = options.grid.lineColor || this.options.grid.lineColor;
            this.options.grid.circleColor = options.grid.circleColor || this.options.grid.circleColor;
            this.options.grid.opacity = options.grid.opacity || this.options.grid.opacity;
        }

        // for barContainer margin top, left, bottom, right
        if ('barContainer' in options) {
            this.options.barContainer.margin.top = options.barContainer.margin.top || this.options.barContainer.margin.top;
            this.options.barContainer.margin.right = options.barContainer.margin.right || this.options.barContainer.margin.right;
            this.options.barContainer.margin.left = options.barContainer.margin.left || this.options.barContainer.margin.left;
            this.options.barContainer.margin.bottom = options.barContainer.margin.bottom || this.options.barContainer.margin.bottom;
        }

        if ('bar' in options) {
            this.options.bar.height = options.bar.height || this.options.bar.height;
            this.options.bar.backgroundColor = options.bar.backgroundColor || this.options.bar.backgroundColor;
            this.options.bar.borderColor = options.bar.borderColor || this.options.bar.borderColor;
            this.options.bar.borderWidth = options.bar.borderWidth || this.options.bar.borderWidth;
            this.options.bar.borderStyle = options.bar.borderStyle || this.options.bar.borderStyle;
            this.options.bar.borderRadius = options.bar.borderRadius || this.options.bar.borderRadius;

            if ('margin' in options.bar) {
                this.options.bar.margin.top = options.bar.margin.top || this.options.bar.margin.top;
                this.options.bar.margin.right = options.bar.margin.right || this.options.bar.margin.right;
                this.options.bar.margin.bottom = options.bar.margin.bottom || this.options.bar.margin.bottom;
                this.options.bar.margin.left = options.bar.margin.left || this.options.bar.margin.left;
            }

            if ('progress' in options.bar) {
                this.options.bar.progressBar.color = options.bar.progressBar.color || this.options.bar.progressBar.color;
                this.options.bar.progressBar.margin = options.bar.progressBar.margin.top || this.options.bar.progressBar.margin;
            }
        }

    }

}



default_config = {
    observer: {
        status: true,
        __observer__: null
    },
    barContainer: {
        margin: {
            top: 18,
            right: 0,
            bottom: 18,
            left: 0,
        },
        totalBars: 4, //dont need to set it 
    },

    grid: {
        totalLines: 5,
        lineColor: '#656565',
        opacity: 1,
        circleColor: '#656565',
        lineLabel: {
            text: (i) => "STEP " + (i + 1),
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#222',
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            }
        }
    },

    bar: {
        height: 23,
        margin: {
            top: 8,
            right: 0,
            bottom: 4,
            left: 0,
        },
        border: {
            width: 1,
            color: 'gray',
            style: 'solid',
            radius: 15  // not used yet ( 17/03/2022 )
        },
        background_color: '#f2f2f2',

        progressBar: {
            color: '#333',
            margin: 3
        },

        rightLabelText: (currentBar, barsList, totalSteps) => ((currentBar.progress / totalSteps) * 100) + "%",

        stepLabel: {
            color: '#fff',
            fontSize: '12px',
        }
    },

}

default_barDetails = {
    barsList: [
        {
            id: 'default_bar_id',
            label: '😜',
            barName: 'Name',
            totalTime: '00:00:00',
            progress: 0,
            order: 1,
            barNameAlign: 'end',
            barNameColor: '#000'
        },
        {
            id: 'ere2',
            label: '😜',
            barName: 'Name',
            totalTime: '00:00:00',
            progress: 0,
            order: 2,
            barNameAlign: 'end',
            barNameColor: '#000'
        }
        , {
            id: 'ere3',
            label: '😜',
            barName: 'Name',
            totalTime: '00:00:00',
            progress: 0,
            order: 3,
            barNameAlign: 'end',
            barNameColor: '#000',
            barColor: '#ff0000'
        }
        , {
            id: 'ere4',
            label: '😜',
            barName: 'Name',
            totalTime: '00:00:00',
            progress: 0,
            order: 4,
            barNameAlign: 'end',
            barNameColor: '#000',
            barColor: '#ff0000'
        }
        , {
            id: 'ere5',
            label: '😜',
            barName: 'Name',
            totalTime: '00:00:00',
            progress: 0,
            order: 5,
            barNameAlign: 'end',
            barNameColor: '#000',
            barColor: '#ff0000'
        }
        , {
            id: 'ere6',
            label: '😜',
            barName: 'Name',
            totalTime: '00:00:00',
            progress: 0,
            order: 6,
            barNameAlign: 'end',
            barNameColor: '#000',
            barColor: '#6565ff'
        }
        , {
            id: 'ere7',
            label: '😜',
            barName: 'Name',
            totalTime: '00:00:00',
            progress: 0,
            order: 7,
            barNameAlign: 'end',
            barNameColor: '#000',
            barColor: '#6565ff'
        }
    ],
}





// calc((var(--total-progress-bars) * (var(--progress-bar-height) + (var(--animate-cont-margin) * 2)) + 35) * 1px)



