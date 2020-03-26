import { post } from '../common/httpRequest';
import loginModel from '../model/loginModel';
import memberModel from '../model/memberModel';

class memberService {
    kakaoJoin(data) {
        post('/api/auth/oauth-kakao-join', {
            id : data.id,
            state : data.state,
            name : data.name || null,
            gender : data.gender || null,
            email : data.email || null
        }, {token: false}).then(response => {
            this.logInStorage(response.data);
        });
    }
    logInStorage(data) {
        localStorage.setItem("loginYn", true);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("image", data.image);
        this.logInState();
    }
    logInState() {
        loginModel.loginData.loginYn = (localStorage.getItem('loginYn')==='true');
        loginModel.loginData.accessToken = localStorage.getItem('accessToken');
        loginModel.loginData.refreshToken = localStorage.getItem('refreshToken');
        memberModel.memberData.name = localStorage.getItem('name') === 'null' ? null : localStorage.getItem('name');
        memberModel.memberData.email = localStorage.getItem('email') === 'null' ? null : localStorage.getItem('email');
        memberModel.memberData.image = localStorage.getItem('image') === 'null' ? null : localStorage.getItem('image');
    }
    removeLoginStorage() {
        localStorage.removeItem('loginYn');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        localStorage.removeItem('image');
        location.reload();
    }
}
export default new memberService();