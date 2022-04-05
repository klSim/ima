import { shallow } from 'enzyme';

import IconButton from '../IconButton';

describe('IconButton atom', () => {
  let wrapper = shallow(<IconButton name='close' />);

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
