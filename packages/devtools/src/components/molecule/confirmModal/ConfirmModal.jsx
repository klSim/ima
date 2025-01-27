import styles from './confirmModal.less';
import React from 'react';
import PropTypes from 'prop-types';

import Button from 'components/atom/button/Button';
import Modal from 'components/atom/modal/Modal';
import ModalFooter from 'components/atom/modal/ModalFooter';

export default class ConfirmModal extends React.PureComponent {
  static get propTypes() {
    return {
      body: PropTypes.any,
      opened: PropTypes.bool,
      accept: PropTypes.func,
      cancel: PropTypes.func,
      hideConfirmModal: PropTypes.func,
    };
  }

  render() {
    const { body, opened } = this.props;

    return (
      <Modal
        title='Confirm'
        className={styles.modal}
        onClose={e => this.onCancel(e)}
        opened={opened}
      >
        <div className={styles.body}>{body}</div>
        <ModalFooter className={styles.footer}>
          <Button onClick={e => this.onConfirm(e)} color='primary'>
            Confirm
          </Button>
          <Button onClick={e => this.onCancel(e)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }

  onConfirm(e) {
    e.preventDefault();

    const { accept, hideConfirmModal } = this.props;

    accept();
    hideConfirmModal();
  }

  onCancel(e) {
    e.preventDefault();

    const { cancel, hideConfirmModal } = this.props;

    cancel && cancel();
    hideConfirmModal();
  }
}
