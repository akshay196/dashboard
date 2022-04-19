/* eslint-disable react/jsx-wrap-multilines */
import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import {
  editProjectWithCallback,
  getRoles,
  getProject,
  getUsers,
  getUserDetail,
  resetProjectEditUser,
} from "actions/index";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import ResourceBreadCrumb from "components/ResourceBreadCrumb";
import RafaySnackbar from "components/RafaySnackbar";
import RafayPageHeader from "components/RafayPageHeader";
import ProjectRoleWidget from "./ProjectRoleWidget";

class EditUser extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      projectId: props.match.params.projectId,
      userId: props.match.params.userId,
      projectName: "",
      selectedUser: null,
      selectedNamespaces: null,
      selectedRoles: null,
      editRoles: null,
    };
  }

  componentDidMount() {
    const { getRoles, getProject, getUsers, getUserDetail } = this.props;
    const { projectId, userId } = this.state;
    getRoles();
    getUsers();
    getProject(projectId);
    getUserDetail(userId);
  }

  static getDerivedStateFromProps(props, state) {
    const newState = { ...state };
    const { projectDetail, userDetail } = props;
    if (projectDetail) {
      newState.projectName = projectDetail.metadata.name;
    }
    if (userDetail) {
      newState.selectedUser = userDetail.metadata.name;
      newState.editRoles = userDetail.spec.projectNamespaceRoles.filter(
        (r) => r.project === state.projectId
      );
    }
    return {
      ...newState,
    };
  }

  componentWillUnmount() {
    const { resetProjectEditUser } = this.props;
    resetProjectEditUser();
  }

  handleResponseErrorClose = () => {
    this.setState({ showAlert: false, alertMessage: null });
  };

  successCallback = () => {
    const { history } = this.props;
    const { projectId } = this.state;
    history.push(`/main/projects/${projectId}`);
  };

  errorCallback = (message) => {
    this.setState({
      showAlert: true,
      alertMessage: message,
    });
  };

  transformRoles = () => {
    const { selectedUser, selectedRoles } = this.state;
    const roles = [];
    selectedRoles.forEach((r) => {
      let ur = {
        user: selectedUser,
        role: r.metadata.name,
      };
      roles.push(ur);
    });
    return roles;
  };

  handleSaveChanges = () => {
    const { editProjectWithCallback, projectDetail } = this.props;
    projectDetail.spec.userRoles = this.transformRoles();
    editProjectWithCallback(
      projectDetail,
      this.successCallback,
      this.errorCallback
    );
  };

  handleUserChange = (user) => {
    this.setState({ selectedUser: user });
  };

  handleRolesChange = (checked) => {
    this.setState({ selectedRoles: checked });
  };

  render() {
    const {
      projectName,
      projectId,
      showAlert,
      alertMessage,
      selectedUser,
      editRoles,
      selectedNamespaces,
    } = this.state;
    const { drawerType, systemRoles, usersList } = this.props;

    let breadcrumbLabel = "";
    if (selectedUser) {
      breadcrumbLabel = selectedUser;
    }

    const config = {
      links: [
        {
          label: `Projects`,
          href: "#/main",
        },
        {
          label: `${projectName}`,
          href: `#/main/projects/${projectId}`,
        },
        {
          label: breadcrumbLabel,
          current: true,
        },
      ],
    };

    return (
      <>
        <div className="m-4">
          <RafayPageHeader
            breadcrumb={<ResourceBreadCrumb config={config} />}
            title="projects.edit_user.layout.title"
            help="projects.edit_user.layout.helptext"
          />
          <ProjectRoleWidget
            onNamespacesChange={this.handleNamespacesChange}
            onUserChange={this.handleUserChange}
            handleRolesChange={this.handleRolesChange}
            systemRoles={systemRoles}
            usersList={usersList}
            editUser={selectedUser}
            editRoles={editRoles}
            editNamespaces={selectedNamespaces}
          />
        </div>
        <Paper
          elevation={3}
          className="workload-detail-bottom-navigation"
          style={{ left: "26px" }}
        >
          <div className="row d-flex justify-content-between pt-3">
            <div className="d-flex flex-row">
              <div className="d-flex align-items-center">
                <Button
                  className="ml-0 bg-white text-red"
                  variant="contained"
                  color="default"
                  onClick={this.successCallback}
                  type="submit"
                >
                  Discard Changes &amp; Exit
                </Button>
              </div>
            </div>
            <div className="next d-flex align-items-center">
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleSaveChanges}
                type="submit"
              >
                <span>Save &amp; Exit</span>
              </Button>
            </div>
          </div>
        </Paper>
        <RafaySnackbar
          open={showAlert}
          severity="error"
          message={alertMessage}
          closeCallback={this.handleResponseErrorClose}
        />
      </>
    );
  }
}

const mapStateToProps = ({ settings, Projects, Users }) => {
  const { userDetail } = Users;
  const { drawerType } = settings;
  const { projectDetail } = Projects;
  const systemRoles = settings.roles.list;
  let usersList = [];
  if (settings.users && settings.users.list) {
    usersList = settings.users.list;
  }
  return {
    drawerType,
    systemRoles,
    usersList,
    userDetail,
    projectDetail,
  };
};

export default withRouter(
  connect(mapStateToProps, {
    editProjectWithCallback,
    getRoles,
    getUsers,
    getProject,
    getUserDetail,
    resetProjectEditUser,
  })(EditUser)
);