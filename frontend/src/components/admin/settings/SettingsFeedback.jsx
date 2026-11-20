/**
 * Status message of a settings card; renders nothing without a message.
 * @param {{message: string}} props
 */
export function SettingsFeedback({ message }) {
  return message ? <p role="status" className="announcement-feedback">{message}</p> : null;
}
