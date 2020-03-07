import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';

import {Providers} from '@microsoft/mgt'
import {MockProvider} from '@microsoft/mgt/dist/es6/mock/MockProvider';

Providers.globalProvider = new MockProvider(true);

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
          <Mgt type={'mgt-people-picker'}
              onSelectionChanged={this.handleSelectionChanged}>
          </Mgt>

          <Mgt type={'mgt-people'}
              people={this.state.people}>
          </Mgt>

          <Mgt type="agenda" groupByDay>
            <MyEvent template="event"></MyEvent>
            <MyHeader template="header"></MyHeader>
          </Mgt>
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
          <Mgt 
            type='person' 
            key={attendee.emailAddress.address} 
            personQuery={attendee.emailAddress.address}>
            </Mgt>)}
      </div>
      <button onClick={clickHandler}>A button I can click</button>
    </div>
}

function MyHeader(props) {
  return <div>MyHeader</div>
}

class Mgt extends React.Component {

  constructor(props) {
    super(props);
    this.mgtComponent = null;

    this.ignoredProps = new Set(['children', 'type']);
  }

  render() {
    let {type} = this.props;
    if (!type.startsWith('mgt-')){
      type = 'mgt-' + type;
    }

    this.processTemplates(this.props.children);

    let templateElements = [];

    if (this.templates) {
      for (let template in this.templates){
        if (this.templates.hasOwnProperty(template)){
          templateElements.push(<template key={template} data-type={template}></template>);
        }
      }
    }

    return React.createElement(type, {ref: this.setRef}, templateElements)
  }

  setRef = (component) => {
    if (component) {
      if (component !== this.mgtComponent){
        this.cleanUp();
      }

      this.mgtComponent = component;
      this.mgtComponent.addEventListener('templateRendered', this.handleTemplateRendered);
      this.syncProps(this.props);
    } else {
      this.cleanUp();
    }
  }

  cleanUp() {
    if (!this.mgtComponent){
      return;
    }

    this.mgtComponent.removeEventListener('templateRendered', this.handleTemplateRendered);

    for (let prop in this.props) {
      if (!this.props.hasOwnProperty(prop)){
        continue;
      }

      if (this.isEventProp(prop, this.props)) {
        this.mgtComponent.removeEventListener(prop[2].toLowerCase() + prop.substring(3), this.props[prop]);
      }
    }

    this.mgtComponent = null;
  }

  componentDidUpdate(prevProps, prevState) {
    // only need to sync updated props
    // unsibscribe previous event handler if needed

    let newProps = {};

    for (let prop in this.props) {
      if (!this.props.hasOwnProperty(prop)){
        continue;
      }

      if (!prevProps[prop] || prevProps[prop] !== this.props[prop]) {
        newProps[prop] = this.props[prop];

        if (prevProps[prop] && this.isEventProp(prop, prevProps)) {
          this.mgtComponent.removeEventListener(prop[2].toLowerCase() + prop.substring(3), prevProps[prop]);
        }
      }
    }

    for (let prop in prevProps) {
      if (!prevProps.hasOwnProperty(prop)){
        continue;
      }

      if (!this.props[prop] && this.isEventProp(prop, prevProps)) {
        this.mgtComponent.removeEventListener(prop[2].toLowerCase() + prop.substring(3), prevProps[prop]);
      }
    }

    this.syncProps(newProps);
  }

  handleTemplateRendered = (e) => {
    let templateType = e.detail.templateType;
    let dataContext = e.detail.context;
    let element = e.detail.element;

    let template = this.templates[templateType];
    if (template) {
      template = React.cloneElement(template, {...dataContext});
      ReactDOM.render(template, element);
    }
  }

  processTemplates(children) {
    if (!children){
      return;
    }

    let templates = {};

    React.Children.forEach(children, (child) => {
      if (child.props.template) {
        templates[child.props.template] = child;
      }
    })

    this.templates = templates;
  }

  syncProps(props) {
    if (this.mgtComponent) {
      for (let prop in props) {

        if (this.ignoredProps.has(prop)){
          continue;
        }

        if (this.isEventProp(prop, props)) {
            this.mgtComponent.addEventListener(prop[2].toLowerCase() + prop.substring(3), props[prop]);
        }
          
        this.mgtComponent[prop] = props[prop];
      }
    }
  }

  isEventProp(prop, props) {
    return prop &&
      prop.length > 2 && 
      prop.startsWith('on') &&
      prop[2] === prop[2].toUpperCase() &&
      typeof(props[prop]) === 'function';
  }
}

export default App;
