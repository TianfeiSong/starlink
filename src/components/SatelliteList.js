import React, {Component} from 'react';
import {Avatar, Button, Checkbox, List, Spin} from "antd";

import satLogo from '../assets/images/satellite.svg';
class SatelliteList extends Component {
    state = {
        selected: []
    }
    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const { isLoading } = this.props;
        return (
            <div className="sat-list-box">
                <div className="btn-container">
                    <Button className="sat-list-btn"
                            type="primary"
                            onClick={this.onShowSatOnMap}
                    >
                        Track on the map
                    </Button>

                </div>
                <hr/>
                {
                    isLoading
                        ?
                        <div className="spin-box">
                            <Spin tip="Loading..." size="large" />
                        </div>
                        :
                        <List itemLayout="horizontal"
                              className="sat-list"
                              dataSource={satList}
                              renderItem={ item =>
                                  <List.Item
                                      actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}>
                                      <List.Item.Meta
                                          avatar={<Avatar
                                              size={48}
                                              src={satLogo}/>}
                                          title={<p>{ item.satname }</p>}
                                          description={`Launch Date: ${item.launchDate}`}
                                      />
                                  </List.Item>

                              }
                        />
                }
            </div>
        );
    }

    onShowSatOnMap = () => {
        this.props.onShowMap(this.state.selected);
    }
    onChange = e => {
        // console.log('selected checkbox', e.target);
        // console.log('data -> ', e.target.dataInfo)
        // step 1: get current selected sat info
        const { dataInfo, checked } = e.target;
        const { selected } = this.state;

        // step 2: add or remove current selected sat to / from selected array
        const list = this.addOrRemove(dataInfo, checked, selected);
        // console.log('list ->', list);
        // step 3: update selected state
        this.setState({
           selected: list
        });
    }

    addOrRemove = ( item, status, list) => {
        // case1: check is true
        //          -> item not in the list => add the item
        //          -> item is in the list => do nothing

        // case2: check is false
        //          -> item not in the list => do nothing
        //          -> item is in the list => remove the item

        const found = list.some( entry => entry.satid === item.satid );

        if (status && !found) {
            list = [...list, item];
            // list.push(item);
        }
        if (!status && found) {
            list = list.filter( entry => entry.satid !== item.satid)
        }

        return list;
    }
}

export default SatelliteList;