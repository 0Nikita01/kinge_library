import React from 'react';
import UIkit from 'uikit';

const ConfirmModal = ({modal, target, method, text}) => {
    const {title, descr, btn, cl} = text;
    return (
        <div id={target} uk-modal={modal.toString()}>
            <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">{title}</h2>
                <p>{descr}</p>
                <p className="uk-text-right">
                    <button className="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                    <button onClick={() => {console.log('click');}} className={cl} type="button">{btn}</button>
                </p>
            </div>
        </div>
    )
};

export default ConfirmModal;
