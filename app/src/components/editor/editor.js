import axios from 'axios';
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';
import React, {Component} from 'react';

export default class Editor extends Component 
{
    constructor()
    {
        super();

        this.state = {
            pageList: [],
            newPageName: ""
        }
        this.createNewPage = this.createNewPage.bind(this);
    }

    componentDidMount()
    {
        this.loadPageList();
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

    render() {
        /*
        const {pageList} = this.state;
        const pages = pageList.map((page, i) => {
            return (
                <h1 key={i}>{page}
                    <a
                    href="#"
                    onClick={() => this.deletePage(page)}>(x)</a>
                </h1>
            )
        });
        */
        return (
            <iframe src="../index.html" frameBorder="0"></iframe>
            /*
            <>
                <input 
                    onChange={(e) => {this.setState({newPageName: e.target.value})}} 
                    type="text"/>
                <button onClick={this.createNewPage}>Create page</button>
                {pages}
            </>
            */
        )
    }
}