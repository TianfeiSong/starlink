import React, {Component} from 'react';
import {
    Button,
    Form,
    InputNumber,
} from 'antd';

class SatSettingForm extends Component {
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 11 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 13 },
            },
        };
        return (
            <Form {...formItemLayout}
                  onSubmit={this.onShowSatellite}
                  className="sat-setting"
            >
                <Form.Item label="Longitude(degrees)">
                    {getFieldDecorator('longitude', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input your Longitude.',
                            },
                        ],
                    })(<InputNumber min={-180}
                                    max={180}
                                    placeholder="Please input Longitude"
                                    style={{width: "100%"}}
                    />)}
                </Form.Item>
                <Form.Item label="Latitude(degrees)">
                    {getFieldDecorator('latitude', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input your Latitude.',
                            },
                        ],
                    })(<InputNumber min={-90}
                                    max={90}
                                    placeholder="Please input Latitude"
                                    style={{width: "100%"}}
                    />)}
                </Form.Item>
                <Form.Item label="Altitude(meters)">
                    {getFieldDecorator('altitude', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input your Elevation.',
                            },
                        ],
                    })(<InputNumber min={-413}
                                    max={8850}
                                    placeholder="Please input Elevation"
                                    style={{width: "100%"}}
                    />)}
                </Form.Item>
                <Form.Item label="Radius(degrees)">
                    {getFieldDecorator('radius', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input your Altitude.',
                            },
                        ],
                    })(<InputNumber min={0}
                                    max={90}
                                    placeholder="Please input Altitude"
                                    style={{width: "100%"}}
                    />)}
                </Form.Item>
                <Form.Item label="Duration(min)">
                    {getFieldDecorator('duration', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input your Duration.',
                            },
                        ],
                    })(<InputNumber min={0}
                                    max={100}
                                    placeholder="Please input Duration"
                                    style={{width: "100%"}}
                    />)}
                </Form.Item>

                <Form.Item className="show-nearby">
                    <Button type="primary"
                            htmlType="submit"
                    >Find Nearby Satellite</Button>
                </Form.Item>
            </Form>
        );
    }

    onShowSatellite = (e) => {
        e.preventDefault();
        this.props.form.validateFields( (err, values) => {
            if (!err) {
                this.props.onShow(values);
            }
        });
    }
}
const SatSetting = Form.create()(SatSettingForm);
export default SatSetting;