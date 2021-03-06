import React, { Component } from 'react';
import style from './depth.module.scss';
import depthVm from './depthVm';
import Radio from '../../../../../commonComponent/radio/radio';
import Checkbox from '../../../../../commonComponent/checkbox/checkbox';

class depth extends Component {
    constructor(props) {
        super(props)
        this.state = {
            checkedVal: '',
            checkedValList: []
        }
    }
    onChangeRadio(e) {
        this.setState({
            checkedVal: e.target.value
        });
        depthVm.setData(this.state.checkedValList, e.target.value);
    }
    onChangeCheck(e, parentId) {
        const checkedValList = this.state.checkedValList;
        let index;
        if(e.target.checked) {
            checkedValList.push({childId : parseInt(e.target.value), parentId : parseInt(parentId)});
        }else {
            index = checkedValList.findIndex(item => item.childId === parseInt(e.target.value));
            checkedValList.splice(index, 1);
        }
        this.setState({ checkedValList: checkedValList });

        depthVm.setData(checkedValList, parseInt(this.state.checkedVal));
    }
    render() {
        let itemEle = [];
        depthVm.itemData.forEach((item) => {
            if(item.param0 === null) {
                itemEle.push(
                <div className={style.row} key={item.survey_question_item_id}>
                    <Radio name="items" value={item.survey_question_item_id} onChange={(e) => this.onChangeRadio(e)}>{item.txt}</Radio>
                </div>);
                depthVm.itemData.forEach((item2) => {
                    if(item.survey_question_item_id === parseInt(item2.param0)) {
                        if(item2.param0 === this.state.checkedVal) {
                            let isChecked = false;
                            this.state.checkedValList.forEach((checkedId) => {
                                if(checkedId.childId === item2.survey_question_item_id) isChecked = true;
                            })
                            itemEle.push(
                            <div className={style.row2} key={item2.survey_question_item_id}>
                                <Checkbox name="items" value={item2.survey_question_item_id} checked={isChecked} onChange={(e) => this.onChangeCheck(e, item.survey_question_item_id)}>{item2.txt}</Checkbox>
                            </div>);
                        }   
                    }
                })
            }
        })
        return (
            <div className={style.depth}>
                {itemEle}
            </div>
        );
    }
}

export default depth;