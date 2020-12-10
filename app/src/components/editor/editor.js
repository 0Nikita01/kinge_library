import "../../helpers/iframeLoader.js";
import axios from 'axios';
import React, {Component} from 'react';
import DOMHelper from '../../helpers/dom-helper';
import EditorText from '../editor-text';
import UIkit from 'uikit';
import Spinner from '../spinner';
import ConfirmModal from '../confirm-modal';
import ChooseModal from '../choose-modal';
import Login from '../login';

export default class Editor extends Component 
{
    constructor()
    {
        super();

        this.currentPage = "index.html";

        this.state = {
            pageList: [],
            newPageName: "",
            loading: true,
            auth: false,
            loginError: false,
            loginLengthError: false
        }
        this.createNewPage = this.createNewPage.bind(this);
        this.isLoading = this.isLoading.bind(this);
        this.isLoaded = this.isLoaded.bind(this);
        this.save = this.save.bind(this);
        this.init = this.init.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount()
    {
        this.checkAuth();
    }

    componentDidUpdate(prevProps, prevState)
    {
        if (this.state.auth !== prevState.auth)
        {
            this.init(null, this.currentPage);
        }
    }

    checkAuth()
    {
        axios
            .get("./api/checkAuth.php")
            .then(res => {
                this.setState({
                    auth: res.data.auth
                })
            })
    }

    login(pass)
    {
        if (pass.length > 5)
        {
            axios
                .post('./api/login.php', {"password": pass})
                .then(res => {
                    this.setState({
                        auth: res.data.auth,
                        loginError: !res.data.auth,
                        loginLengthError: false
                    })
                })
        }
        else
        {
            this.setState({
                loginError: false,
                loginLengthError: true
            })
        }
    }

    logout()
    {
        axios
            .get("./api/logout.php")
            .then(() => {
                window.location.replace("/react_admin/");
            })
    }

    init(e, page)
    {
        if (e)
        {
            e.preventDefault();
        }
        if (this.state.auth)
        {
            this.isLoading();
            this.iframe = document.querySelector('iframe');
            this.open(page, this.isLoaded);
            this.loadPageList();
        }
    }

    open(page, cb)
    {
        this.currentPage = page;

        axios
            .get(`../${page}?rnd=${Math.random()}`)
            .then(res => DOMHelper.parseStringToDOM(res.data))
            .then(DOMHelper.wrapTextNodes)
            .then(dom => {
                this.virtualDOM = dom;
                return dom;
            })
            .then(DOMHelper.serializeDOMToSrting)
            .then(html => axios.post("./api/saveTempPage.php", {html}))
            .then(() => this.iframe.load("../yguyhfjfj34256_3356.html"))
            .then(() => axios.post("./api/deleteTempPage.php"))
            .then(() => this.enableEditing())
            .then(() => this.injectStyles())
            .then(cb);
    }

    save(onSuccess, onError)
    {
        this.isLoading();
        const newDom = this.virtualDOM.cloneNode(this.virtualDOM);
        DOMHelper.unwrapTextNodes(newDom);
        const html = DOMHelper.serializeDOMToSrting(newDom);
        axios
            .post("./api/savePage.php", {pageName: this.currentPage, html})
            .then(onSuccess)
            .catch(onError)
            .finally(this.isLoaded);

    }

    enableEditing()
    {
        this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(element => {
            const id = element.getAttribute("nodeid");
            const virtualElement = this.virtualDOM.body.querySelector(`[nodeid="${id}"]`);
            new EditorText(element, virtualElement);
        });
    }

    injectStyles()
    {
        const style = this.iframe.contentDocument.createElement("style");
        style.innerHTML = `
            text-editor:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
            text-editor:focus {
                outline: 3px solid red;
                outline-offset: 8px;
            }
        `;
        this.iframe.contentDocument.head.appendChild(style);
    }

    loadPageList() {
        axios
            .get("./api/pageList.php")
            .then(res => this.setState({pageList: res.data}))
    }

    createNewPage() {
        axios
            .post("./api/createNewPage.php", {"name": this.state.newPageName})
            .then(this.loadPageList())
            .catch(() => alert("The page already exists!"));
    }

    deletePage(page) {
        axios
        .post("./api/deletePage.php", {"name": page})
        .then(this.loadPageList())
        .catch(() => alert("The page doesn't exists!"));
    }

    addEventToLogout()
    {
        const logout = this.logout;
        const elem = document.getElementsByClassName('logout')[0];
        elem.addEventListener('click', ft_Exit);

        function ft_Exit()
        {
            logout();
            elem.removeEventListener('click', ft_Exit);
        }
    }

    addEventToSave()
    {
        const save = this.save;
        const elem = document.getElementsByClassName('save')[0];
        elem.addEventListener('click', addNotification);
        
        function addNotification()
        {
            save(() => {
                UIkit.notification({message: 'Successfull', status: 'success'})
            },
            () => {
                UIkit.notification({message: 'Failure', status: 'danger'})
            });
            elem.removeEventListener('click', addNotification);
        }
    }

    addEventToRedirect(data)
    {
        const elems = document.getElementsByClassName('redir');

        for (let i = 0; i < elems.length; i++)
        {
            elems[i].addEventListener('click', (e) => {
                this.init(e, data[i]);
            })
        }
        
        /*
        data.forEach(elem => {
            console.log(elem);
            elem.addEventListener('click', (e) => {
                this.init(e, elem.innerHTML);
            })
        })*/
    }

    isLoading()
    {
        this.setState({
            loading: true
        })
    }

    isLoaded()
    {
        this.setState({
            loading: false
        })
    }

    render() {
        const {loading, pageList, auth, loginError, loginLengthError} = this.state;
        const modal = true;
        let spinner;

        loading ? spinner = <Spinner active/> :spinner = <Spinner />

        if (!auth)
        {
            return <Login login={this.login} lengthErr={loginLengthError} loginErr={loginError}/>
        }

        return (
            <>
                <iframe src="" frameBorder="0"></iframe>

                {spinner}

                <div className="panel">
                    <button onClick = {() => this.addEventToRedirect(pageList)} className="uk-button uk-button-primary uk-margin-small-right" uk-toggle="target: #modal-open">Open</button>

                    <button onClick={() => this.addEventToSave()} className="uk-button uk-button-primary uk-margin-small-right" uk-toggle="target: #modal-save">Publication</button>
                    <button onClick={() => this.addEventToLogout()} className="uk-button uk-button-danger" uk-toggle="target : #modal-logout">Выход</button>
                </div>

                <ConfirmModal modal={modal} target={'modal-save'} method={this.save} text={{
                    title: "Save",
                    descr: "Do you want to save your changes?",
                    btn: "Save",
                    cl : "save uk-button uk-button-primary uk-modal-close"

                }}/>
                <ConfirmModal modal={modal} target={'modal-logout'} method={this.logout} text={{
                    title: "Logout",
                    descr: "Do you want logout?",
                    btn: "Exit",
                    cl : "logout uk-button uk-button-primary uk-modal-close"

                }}/>
                <ChooseModal modal={modal} target={'modal-open'} data={pageList} redirect={this.init}/>

            </>
            
        )
    }
}