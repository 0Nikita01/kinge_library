import "../../helpers/iframeLoader.js";
import axios from 'axios';
import React, {Component} from 'react';
import DOMHelper from '../../helpers/dom-helper';
import EditorText from '../editor-text';
import UIkit from 'uikit';
import Spinner from '../spinner';
import ConfirmModal from '../confirm-modal';

export default class Editor extends Component 
{
    constructor()
    {
        super();

        this.currentPage = "index.html";

        this.state = {
            pageList: [],
            newPageName: "",
            loading: true
        }
        this.createNewPage = this.createNewPage.bind(this);
        this.isLoading = this.isLoading.bind(this);
        this.isLoaded = this.isLoaded.bind(this);
        this.save = this.save.bind(this);
    }

    componentDidMount()
    {
        this.init(this.currentPage);
    }

    init(page)
    {
        this.iframe = document.querySelector('iframe');
        this.open(page, this.isLoaded);
        this.loadPageList();
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
            .then(() => this.iframe.load("../temp.html"))
            .then(() => this.enableEditing())
            .then(() => this.injectStyles())
            .then(cb);
    }

    save(onSuccess, onError)
    {
        console.log('save');
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
            .get("./api")
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

    addEventToSave()
    {
        const elem = document.getElementsByClassName('save')[0];
        elem.addEventListener('click', () => this.save(() => {
            UIkit.notification({message: 'Successfull', status: 'success'})
        },
        () => {
            UIkit.notification({message: 'Failure', status: 'danger'})
        } 
        ));
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
        const {loading} = this.state;
        const modal = true;
        let spinner;

        loading ? spinner = <Spinner active/> : <Spinner />

        return (
            <>
                <iframe src={this.currentPage} frameBorder="0"></iframe>

                {spinner}

                <div className="panel">
                    <button className="uk-button uk-button-primary uk-margin-small-right" uk-toggle="target: #modal-open">Open</button>

                    <button onClick={() => this.addEventToSave()} className="uk-button uk-button-primary" uk-toggle="target: #modal-save">Publication</button>
                </div>

                <ConfirmModal modal={modal} target={'modal-save'} method={this.save}/>
            </>
            
        )
    }
}