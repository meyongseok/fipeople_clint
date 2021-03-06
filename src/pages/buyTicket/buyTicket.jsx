import React, {Component, Fragment} from 'react';
import Header from '../../commonComponent/header/header';
import Content from '../../commonComponent/contentBox/content';
import style from './buyTicket.module.scss';
import {iamport} from '../../common/iamportModule'
import {withRouter} from 'react-router';
import qs from 'qs';
import buyTicketVm from './buyTicketVm'
import {observer} from 'mobx-react'
import {post} from '../../common/httpRequest'
import {templateLink} from '../../common/kakaoModule'

@observer
class buyTicket extends Component {
    componentDidMount() {
        buyTicketVm.loadTickets();
    }

    constructor(props) {
        super(props)
        console.log(this.props);
        if (this.props.match.path === '/ticket/complete/:redirectUrl') {
            this.afterPayment(qs.parse(this.props.location.search.substring(1)), true)
        }
        this.state = {
            ticketCount: 1,
        }
    }

    get price() {
        const price = 8400;
        const x = this.state.ticketCount * price;
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    changeCount(type) {
        const count = this.state.ticketCount;
        if (type === 'min') {
            if (count !== 1) {
                this.setState({
                    ticketCount: count - 1
                });
            }
        } else {
            this.setState({
                ticketCount: count + 1
            });
        }
    }

    async openPaymentPopup() {
        try {
            const response = await post('/api/ticket/order', {}, {token: true});

            iamport().request_pay({
                pg: 'inicis',
                pay_method: 'card',
                merchant_uid: response.data.merchantUid,
                name: '파이피플 - 티켓 1개',
                amount: response.data.amount,
                buyer_email: buyTicketVm.orderInfo.email,
                buyer_name: buyTicketVm.orderInfo.name,
                // buyer_tel: '010-0000-1111',
                m_redirect_url: `${location.origin}/ticket/complete/${this.props.match.params.redirectUrl}`
            }, (rsp) => {
                this.afterPayment(rsp);
            });
        } catch (e) {
            if (e.message === 'ALREADY_HAVE_TICKET') {
                alert('이미 티켓을 보유하고 있습니다.');
                buyTicketVm.loadTickets();
                return;
            }
        }

    }

    shareSite() {
        fbq('track', 'Donate');
        templateLink(24772);
    }

    async afterPayment(data, isMobile = false) {
        let msg = '';
        let isErr = false;
        if (isMobile && !data.error_msg || data.success) {
            try {
                await post('/api/ticket/order/check', {
                    impUid: data.imp_uid,
                    merchantUid: data.merchant_uid,
                }, {token: true});
                window.fbq('track', 'Purchase', {value: 8400, currency: 'KRW'});
                alert('결제가 완료되었습니다.');

            } catch (e) {
                if (e.message === 'ALREADY_HAVE_TICKET') {
                    alert('이미 티켓을 보유하고 있습니다.');
                }
            }
            buyTicketVm.loadTickets();
        } else if (data.error_msg) {
            isErr = true;
            msg += '결제에 실패하였습니다.';
            msg += '에러내용 : ' + data.error_msg;
            alert(msg);
        } else {
            isErr = true;
            alert("결제에 실패하였습니다. 관리자에게 문의해주세요.");
        }

        if(this.props.match.params.redirectUrl === 'ticket' || isErr) {
            this.props.history.replace(`/ticket/ticket`);
        }else{
            this.props.history.replace(`/survey/${this.props.match.params.redirectUrl}`);
        }
    }

    render() {
        return (
            <Fragment>
                <Header/>
                <div className={style.topInfo}>
                    <div className={style.content}>
                        <div className={style.sTitle}>취미부터 관심사까지 맞는 친구를 찾아보세요.</div>
                        <div className={style.title}>나와 잘 맞는 친구를<br/>찾아볼까요?</div>
                    </div>
                </div>
                <div className={style.contentBox} hidden={!buyTicketVm.tickets}>
                    <Content width={420} padding={'30px 40px'}>
                        <div style={{textAlign:"center"}}>
                            <div className={style.title}>나와 잘 맞는 친구 찾기</div>
                            <div className={style.ticketImg}>
                                <span className={style.bg}><img src="/img/ticketImg.png"/></span>
                            </div>
                            <div className={style.countWrapper}>
                                {/*<button type="button" className={style.mBtn} onClick={() => this.changeCount('min')}></button>*/}
                                <span>파이티켓 <span className={style.count}>{this.state.ticketCount}</span> 개</span>
                                {/*<button type="button" className={style.pBtn} onClick={() => this.changeCount('plus')}></button>*/}
                            </div>
                            <div className={style.subInfo}>* 파이 1개는 서비스 1번 입니다.</div>
                            <div className={style.beforePrice}><span>12,000원</span></div>
                            <div className={style.price}>8,400원</div>
                            <div className={style.btnArea}>
                                <button type="button" onClick={() => this.shareSite()}>kakao 공유</button>
                                {buyTicketVm.tickets && (buyTicketVm.tickets.length ? (
                                    <button type="button" disabled>티켓 보유중</button>
                                ) : (
                                    <button type="button" onClick={() => this.openPaymentPopup()}>구매하기</button>
                                ))}
                            </div>
                        </div>
                    </Content>
                </div>
            </Fragment>
        );
    }
}

export default withRouter(buyTicket);