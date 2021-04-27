import React, {Component} from 'react';
import axios from 'axios';
import { feature } from 'topojson-client';

import { WORLD_MAP_URL, SATELLITE_POSITION_URL, SAT_API_KEY } from '../constants'
import { geoKavrayskiy7 } from 'd3-geo-projection';
import { geoPath, geoGraticule } from 'd3-geo';
import { select as d3Select } from 'd3-selection';
import { timeFormat as d3TimeFormat } from 'd3-time-format';
import { schemeCategory10 } from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";


const width = 960;
const height = 600;

class WorldMap extends Component {
    constructor() {
        super();
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
        this.map = null;
        this.color = d3Scale.scaleOrdinal(schemeCategory10);
        this.state = {
            isLoading: false,
            isDrawing: false
        }
    }
    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then( res => {
                const { data } = res;
                const land = feature(data, data.objects.countries).features;
                this.generateMap(land);
            }).catch( err => {
                console.log(`err in fetching data ${err}`);
        });
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.satData !== this.props.satData) {
            const {
                latitude,
                longitude,
                altitude,
                duration
            } = this.props.observerData;

            const endTime = duration * 60;
            // step1: prepare for urls
            const urls = this.props.satData.map(sat => {
                const { satid } = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${altitude}/${endTime}/&apiKey=${SAT_API_KEY}`;
                // send ajax call
                return axios.get(url);
            });
            // console.log('urls->',urls)
            // step2: fetch sats positions

            Promise.all(urls).then(res => {
                console.log('res->',res)
                const arr = res.map(sat => sat.data);
                this.setState({
                    isLoading: false,
                    isDrawing: true,
                });

                //case1: isDrawing true -> cannot track
                //case2: isDrawing false -> track
                if (!prevState.isDrawing) {
                    // drawing position
                    this.track(arr);
                } else {
                    const oHint = document.getElementsByClassName("hint")[0];
                    oHint.innerHTML = "Please wait for these satellite animation to finish before selection new ones!";
                }

            }).catch( err => {
                console.log('err in fetch satellite orbit:', err.message);
            });
        }
    }

    track = data => {
        //canvas2 ?
        if (!data || !data[0].hasOwnProperty('positions')) {
            throw new Error("no position data");
        }

        const len = data[0].positions.length;
        const { context2 } = this.map;

        let now = new Date();
        let i = 0;
        let speedUp = 5;

        let timer = setInterval(() => {
            let ct = new Date();

            let timePassed = i === 0 ? 0 : ct - now;
            let time = new Date(now.getTime() + speedUp * 60 * timePassed);

            context2.clearRect(0, 0, width, height);

            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            const formatTime = d3TimeFormat("%a %B %d %Y %H:%M GMT %Z");
            context2.fillText(formatTime(time), width / 2, 10);

            if (i >= len) {
                clearInterval(timer);
                this.setState({ isDrawing: false });
                const oHint = document.getElementsByClassName("hint")[0];
                oHint.innerHTML = "";
                return;
            }
            data.forEach(sat => {
                const { positions, info } = sat;
                this.drawSat(info, positions[i]);
            });

            i += 3;
        }, 50 / speedUp);
    }

    drawSat = (sat, pos) => {
        const { satlatitude, satlongitude } = pos;
        if (!satlatitude || !satlongitude) return;

        const { satname } = sat;
        const name = satname.match(/\d+/g).join("");

        const { projection, context2 } = this.map;

        const xy = projection([satlatitude, satlongitude]);
        context2.fillStyle = this.color(name);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4,0, 2 * Math.PI);
        context2.fill();
        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(name, xy[0], xy[1] + 10);

    }

    generateMap = land => {
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(0.1);
        const graticule = geoGraticule();
        const canvas = d3Select(this.refMap.current)
            .attr("width", width)
            .attr("height", height);
        const canvas2 = d3Select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height);

        let context = canvas.node().getContext("2d");
        let context2 = canvas2.node().getContext("2d");

        let path = geoPath().projection(projection).context(context);

        land.forEach( ele => {
            context.fillStyle = '#B3DDEF';
            context.strokeStyle = '#000';
            context.globalAlpha = 0.7;
            context.beginPath();
            path(ele);
            context.fill();
            context.stroke();

            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();
        });

        this.map = {
            context: context,
            context2: context2,
            projection: projection
        }
    }
    render() {
        return (
            <div className="map-box">
                <canvas className="map" ref={this.refMap} />
                <canvas className="track" ref={this.refTrack} />
                <div className="hint" />
            </div>
        );
    }
}

export default WorldMap;