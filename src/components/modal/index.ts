import Modal, {
  type ModalProps as TModalProps,
  type DialogProps as TDialogProps,
} from "./Modal";

import { type ModalLegacyProps as TModalLegacyProps } from "./ModalLegacy";

import ModalHeader from "./ModalHeader";
import ModalBody from "./ModalBody";
import ModalActions from "./ModalActions";
import ModalLegacy from "./ModalLegacy";

export type ModalProps = TModalProps;
export type ModalLegacyProps = TModalLegacyProps;
export type DialogProps = TDialogProps;

export { ModalHeader, ModalBody, ModalActions, ModalLegacy };

export default Object.assign(Modal, {
  Header: ModalHeader,
  Body: ModalBody,
  Actions: ModalActions,
  Legacy: ModalLegacy,
});
