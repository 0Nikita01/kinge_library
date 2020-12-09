import React from 'react';
import UIkit from 'uikit';

const ConfirmModal = ({modal, target, method}) => {
    return (
        <div id={target} uk-modal={modal.toString()}>
            <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">Save</h2>
                <p>Do you want to save your changes?</p>
                <p className="uk-text-right">
                    <button className="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                    <button className="save uk-button uk-button-primary uk-modal-close" type="button">Save</button>
                </p>
            </div>
        </div>
    )
};

export default ConfirmModal;
