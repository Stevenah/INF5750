import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Paper from 'material-ui/Paper';
import EditToolbar from './EditToolbar';
import EditArea from './EditArea';
import { fetchAndDisplayKeyValue, fetchAndToggleNamespace,
    updateValue, valueChange, rejectUpdateValue } from 'actions/actions';

import '../../../../style/display/display.scss';

export class EditDisplay extends Component {

    constructor() {
        super();
        this.state = {
            valueError: null,
        };
    }

    componentDidMount() {
        const { getValue, params: { namespace, key } } = this.props;
        if (typeof namespace !== 'undefined' && typeof key !== 'undefined') {
            getValue(namespace, key);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { fetchedNamespaces, params: nextParams } = nextProps;
        const { fetchKeysForNamespace,
            getValue, params: currentParams } = this.props;
        // Load keys for namespace if its not already loaded

        if (!this.props.fetchedNamespaces && fetchedNamespaces ||
            !fetchedNamespaces) {
            fetchKeysForNamespace(nextParams.namespace, true);
        }

        // Get value when url is different from last.
        if ((currentParams.namespace !== nextParams.namespace ||
            currentParams.key !== nextParams.key)) {
            getValue(nextParams.namespace, nextParams.key);
        }
    }

    handleSaveValue() {
        const { editedValue } = this.props;
        const { namespace, key } = this.props.params;

        if (this.state.valueError) {
            this.props.rejectUpdateValue(namespace, key, editedValue, 'Failed to update value: Not valid JSON');
        } else if (editedValue) {
            this.props.updateValue(namespace, key, editedValue);
        }
    }

    handleChangeValue(data, err) {
        const { valueChange } = this.props;
        const { namespace, key } = this.props.params;
        if (err) {
            this.setState({
                ...this.state,
                valueError: err,
            });
        } else {
            valueChange(namespace, key, data);
        }
    }

    render() {
        const { namespace, key } = this.props.params;

        let path = '';

        if (typeof namespace !== 'undefined') {
            path += namespace;
        }
        if (typeof key !== 'undefined') {
            path += `/${key}`;
        }

        return (
        <Paper className={'fff-display'}>
            <EditToolbar path={path} handleSave={this.handleSaveValue.bind(this)} />
            <EditArea namespace = { namespace }
                selectedKey = { key }
                value = { this.props.value }
                valueChange = { this.handleChangeValue.bind(this) }
            />
        </Paper>
        );
    }
}

EditDisplay.propTypes = {
    selectedKey: PropTypes.string,
    namespace: PropTypes.string,
    fetchedNamespaces: PropTypes.bool,
    fetchKeysForNamespace: PropTypes.func,
    updateValue: PropTypes.func,
    rejectUpdateValue: PropTypes.func,
    getValue: PropTypes.func,
    params: PropTypes.shape({
        namespace: PropTypes.string,
        key: PropTypes.string,
    }),
};

const mapStateToProps = (state) => ({
    value: state.display.value,
    editedValue: state.display.editedValue,
    fetchedNamespaces: state.sidebar.fetched,
});

const mapDispatchToProps = (dispatch) => ({
    getValue(namespace, key) {
        dispatch(fetchAndDisplayKeyValue(namespace, key));
    },
    fetchKeysForNamespace(namespace, open) {
        dispatch(fetchAndToggleNamespace(namespace, open));
    },
    updateValue(namespace, key, value) {
        dispatch(updateValue(namespace, key, value));
    },
    valueChange(namespace, key, value) {
        dispatch(valueChange(namespace, key, value));
    },
    rejectUpdateValue(namespace, key, value, err) {
        dispatch(rejectUpdateValue(namespace, key, value, err));
    },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditDisplay);
