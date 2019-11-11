import React, { Component } from 'react'
import {
  DatePickerAndroid,
  DatePickerIOS,
  Platform,
  Modal,
  View,
  StyleSheet,
  ViewPropTypes,
  Button
} from 'react-native'
import PropTypes from 'prop-types'

const isAndroid = Platform.OS === 'android'

function noop() { }

/**
 * React Native DatePicker Modal Component for iOS/Android
 */
class DatePicker extends Component {
  state = {
    show: this.props.show || false,
    date: undefined
  }

  static defaultProps = {
    startDate: new Date(),
    onClose: noop,
    onError: noop,
    onDateChanged: noop,
    maxDate: new Date(32519532187368),
    minDate: new Date(0),
    modalButtonText: 'Done'
  }

  static propTypes = {
    /**
       * Start date for DatePicker (Default: Current Date `new Date()`).
       */
    startDate: PropTypes.instanceOf(Date),
    /**
       * Function called with error argument if there is error setting date:
       *
       * @example
       * ```js
       * function onError(error) {
       *    console.log(error)
       * }
       */
    /**
     * Function called when modal closed
     */
    onClose: PropTypes.func,
    onError: PropTypes.func,
    /**
       * Function called when new date has been selected. Receives object with selected `date`, `year`, `day` and `month`.
       */
    onDateChanged: PropTypes.func,
    /**
       * Minimum date that can be selected.
       */
    minDate: PropTypes.instanceOf(Date),
    /**
       * Maximum date that can be selected.
       */
    maxDate: PropTypes.instanceOf(Date),
    /**
       * Text for the iOS modal button (default: "Done").
       */
    modalButtonText: PropTypes.string,
    /**
       * Styles for the modal overlay.
       */
    modalOverlayStyle: ViewPropTypes.style,
    /**
       * Styles for the modal.
       */
    modalStyle: ViewPropTypes.style,
    /**
       * Styles for the modal button.
       */
    modalButtonStyle: ViewPropTypes.style,
    /**
       * Styles for the modal button container.
       */
    modalBtnContainer: ViewPropTypes.style,
  }

  componentDidMount = () => {
    this.handleShow()
  }

  componentDidUpdate = (prevProps) => {
    if(prevProps.show !== this.props.show) this.handleShow()
  }

  handlePressed = async () => {
    const { startDate, onError, minDate, maxDate } = this.props
    const { date } = this.state

    if (isAndroid) {
      try {
        const { action, year, month, day } = await DatePickerAndroid.open({
          date: date || startDate,
          minDate: minDate,
          maxDate: maxDate
        })

        const newDate = new Date(year, month, day)

        this.props.onClose()

        if (action !== DatePickerAndroid.dismissedAction) {
          this.setState(() => ({ date: newDate, startDate: newDate }));
          this.props.onDateChanged(this.getDateObj()); this.props.onClose()
        }

      } catch (error) {
        onError(error)
      }
    } else {
      this.setState({ show: true });
    }
  }

  getDateObj = () => {
    const { date } = this.state

    return {
      date,
      year: date ? date.getFullYear() : '',
      day: date ? `${date.getDate()}`.padStart(2, '0') : '',
      month: date ? `${date.getMonth() + 1}`.padStart(2, '0') : ''
    }
  }

  handleModalClose = () => {
    this.setState({
      show: false
    },
      () => {
        this.props.onClose();

        const { onDateChanged } = this.props;
        onDateChanged(this.getDateObj());
      }
    )
  }

  handleDateChange = date => this.setState({ date, startDate: date })

  renderIOS = () => {

    const {
      startDate,
      maxDate,
      minDate,
      modalButtonText,
      modalOverlayStyle,
      modalStyle,
      modalButtonStyle,
      modalBtnContainer,
      style,
      ...props
    } = this.props

    return (
      <Modal
        animationType='fade'
        transparent
        visible={this.state.show}
        onRequestClose={this.handleModalClose}
      >
        <View style={[styles.overlay, modalOverlayStyle]}>
          <View style={[styles.modal, modalStyle]}>
            <View style={[styles.modalBtnContainer, modalBtnContainer]}>
              <Button
                style={[modalButtonStyle]}
                title={modalButtonText}
                onPress={this.handleModalClose}
              />
            </View>
            <DatePickerIOS
              mode='date'
              date={this.state.date || startDate}
              onDateChange={this.handleDateChange}
              maximumDate={maxDate}
              minimumDate={minDate}
              {...props}
            />
          </View>
        </View>
      </Modal>
    )
  }

  handleShow = () => {
    this.props.show && this.handlePressed()
  }

  renderAndroid = () => {
    return (<View></View>)
  }

  render() {
    return isAndroid ? this.renderAndroid() : this.renderIOS();
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.3)',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  modal: { backgroundColor: '#fff', height: 260, width: '100%' },
  modalBtnContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    marginTop: 15
  }
})

export default DatePicker
