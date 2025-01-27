import React from 'react';
import { shallow } from 'enzyme';
import PresetEntry from '../PresetEntry';

describe('PresetEntry molecule', () => {
  let wrapper, instance;

  const event = {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  };

  const props = {
    id: '0',
    preset: {
      id: '0',
      name: 'Default',
      editable: false,
      selected: true,
      hooks: {},
    },
    onClick: jest.fn(),
    renamePreset: jest.fn(),
    copyPreset: jest.fn(),
    deletePreset: jest.fn(),
    alertSuccess: jest.fn(),
    showConfirmModal: jest.fn(),
  };

  beforeEach(() => {
    wrapper = shallow(<PresetEntry {...props} />);
    instance = wrapper.instance();

    event.preventDefault.mockClear();
    event.stopPropagation.mockClear();
  });

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('should match snapshot when editable', () => {
    wrapper.setState({
      editable: true,
    });

    expect(wrapper).toMatchSnapshot();
  });

  it('should trigger onClick when clicked on entry item', () => {
    jest.spyOn(instance, 'onClick').mockImplementation();
    wrapper.first().simulate('click');

    expect(instance.onClick.mock.calls).toHaveLength(1);
  });

  describe('onChange', () => {
    it('should set value to state name', () => {
      jest.spyOn(instance, 'setState').mockImplementation();

      instance.onChange({
        target: {
          value: 'newName',
        },
      });

      expect(instance.setState.mock.calls).toHaveLength(1);
      expect(instance.setState.mock.calls[0][0]).toStrictEqual({
        name: 'newName',
      });
    });
  });

  describe('onClick', () => {
    it("should call onClick from props if it's not in editable state", () => {
      wrapper.setState({
        editable: false,
      });

      instance.onClick(event);

      expect(event.preventDefault.mock.calls).toHaveLength(1);
      expect(event.stopPropagation.mock.calls).toHaveLength(1);
      expect(instance.props.onClick.mock.calls).toHaveLength(1);
      instance.props.onClick.mockClear();
    });

    it('should do nothing if the item is currently being edited', () => {
      wrapper.setState({
        editable: true,
      });

      instance.onClick(event);

      expect(event.preventDefault.mock.calls).toHaveLength(1);
      expect(event.stopPropagation.mock.calls).toHaveLength(1);
      expect(instance.props.onClick.mock.calls).toHaveLength(0);
    });
  });

  describe('onConfirm', () => {
    it('should rename preset and set editable to false', () => {
      wrapper.setState({ name: 'newName' });
      jest.spyOn(instance, 'setState').mockImplementation();

      instance.onConfirm(event);

      expect(event.preventDefault.mock.calls).toHaveLength(1);
      expect(event.stopPropagation.mock.calls).toHaveLength(1);

      expect(instance.props.renamePreset.mock.calls).toHaveLength(1);
      expect(instance.props.renamePreset.mock.calls[0][0]).toStrictEqual({
        id: '0',
        name: 'newName',
      });

      expect(instance.setState.mock.calls).toHaveLength(1);
      expect(instance.setState.mock.calls[0][0]).toStrictEqual({
        editable: false,
      });
    });
  });

  describe('onCopy', () => {
    it('should call copyPreset from props with preset id', () => {
      instance.onCopy(event);

      expect(event.preventDefault.mock.calls).toHaveLength(1);
      expect(event.stopPropagation.mock.calls).toHaveLength(1);

      expect(instance.props.copyPreset.mock.calls).toHaveLength(1);
      expect(instance.props.copyPreset.mock.calls[0][0]).toBe(props.id);
    });
  });

  describe('onEdit', () => {
    it('should set state editable to true', () => {
      jest.spyOn(instance, 'setState').mockImplementation();
      instance.onEdit(event);

      expect(event.preventDefault.mock.calls).toHaveLength(1);
      expect(event.stopPropagation.mock.calls).toHaveLength(1);

      expect(instance.setState.mock.calls).toHaveLength(1);
      expect(instance.setState.mock.calls[0][0]).toStrictEqual({
        editable: true,
      });
    });
  });

  describe('onDelete', () => {
    it('should prevent default and stop propagation', () => {
      instance.onDelete(event);

      expect(event.preventDefault.mock.calls).toHaveLength(1);
      expect(event.stopPropagation.mock.calls).toHaveLength(1);
      instance.props.showConfirmModal.mockClear();
    });

    it('should show confirm modal', () => {
      instance.onDelete(event);

      expect(instance.props.showConfirmModal.mock.calls).toHaveLength(1);
      expect(
        Object.keys(instance.props.showConfirmModal.mock.calls[0][0])
      ).toStrictEqual(['body', 'accept']);
    });
  });

  describe('onDiscard', () => {
    it('should discard the state and set editable to false', () => {
      jest.spyOn(instance, 'setState').mockImplementation();

      instance.onDiscard(event);

      expect(event.preventDefault.mock.calls).toHaveLength(1);
      expect(event.stopPropagation.mock.calls).toHaveLength(1);

      expect(instance.setState.mock.calls).toHaveLength(1);
      expect(instance.setState.mock.calls[0][0]).toStrictEqual({
        name: props.preset.name,
        editable: false,
      });
    });
  });
});
