import * as React from 'react';
import Checkbox from "./Checkbox";
import FileData from '../models/FileData';

const OPTIONS = ["One", "Two", "Three"];

export interface UploadFilesListProps {
    filesCheckboxState: Boolean[];
    handleCheckboxChange: Function;
    filesList: FileData[];
}

interface UploadeFilesListState {
    filesCheckboxState: Boolean[];
}

export class UploadFilesList extends React.Component<UploadFilesListProps, UploadeFilesListState> {

  handleCheckboxChange = (index) => {
    this.props.handleCheckboxChange(index);
  };

  createCheckbox = option => (
    <Checkbox
      label={option.fileName}
      isSelected={this.props.filesCheckboxState[option.index]}
      onCheckboxChange={ () => this.handleCheckboxChange(option.index)}
      key={option.index}
    />
  );

  createCheckboxes = () => this.props.filesList.map(this.createCheckbox);

  render() {
    return (
      <div className="container">
        <div className="row mt-5">
          <div className="col-sm-12">
            {this.createCheckboxes()}
          </div>
        </div>
      </div>
    );
  }
}