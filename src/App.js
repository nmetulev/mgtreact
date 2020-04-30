import React from 'react';
import './App.css';

import {Providers, MgtPerson, MgtPeople, MgtPeoplePicker, MgtAgenda} from '@microsoft/mgt'
import {MockProvider} from '@microsoft/mgt/dist/es6/mock/MockProvider';
import {wrapMgt} from 'mgt-react';

Providers.globalProvider = new MockProvider(true);

const PeoplePicker = wrapMgt(MgtPeoplePicker);
const People = wrapMgt(MgtPeople);
const Person = wrapMgt(MgtPerson);
const Agenda = wrapMgt(MgtAgenda);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {people: []};
  }

  handleSelectionChanged = (e) => {
    this.setState({people: e.target.selectedPeople});
  }

  render() {

      return (
        <div>
          <PeoplePicker selectionChanged={this.handleSelectionChanged} />

          <People people={this.state.people} />

          <Agenda groupByDay>
            <MyEvent template="event"></MyEvent>
            <MyHeader template="header"></MyHeader>
          </Agenda>
        </div>
        );
  }
}

function MyEvent(props) {

  let clickHandler = (e) => {
    console.log('clicked ', props.event.subject);
  }

  return <div>
    {props.event.subject}
      <div>
        {props.event.attendees.map(attendee => 
          <Person key={attendee.emailAddress.address} personQuery={attendee.emailAddress.address} />)}
      </div>
      <button onClick={clickHandler}>A button I can click</button>
    </div>
}

function MyHeader(props) {
  return <div>MyHeader</div>
}

export default App;
