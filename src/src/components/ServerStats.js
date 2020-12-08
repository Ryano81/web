import React from "react";

import "./ServerStats.css";

export default class ServerStats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      guilds: 0,
      activeGames: 0,
    };
  }

  async fetchData() {
    try {
      const response = await fetch("https://stats.automute.us/stats/api");
      const json = await response.json();
      this.setState({
        isLoaded: true,
        guilds: json.totalGuilds,
        activeGames: json.activeGames,
      });
    } catch (error) {
      this.setState({
        isLoaded: true,
        error,
      });
    }
  }

  componentDidMount() {
    this.fetchData();
    this.interval = setInterval(() => {
      this.fetchData();
    }, 7000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { error, isLoaded, guilds, activeGames } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else {
      return (
        <div
          id="home-stats"
          className="d-flex align-content-center align-content-lg-start flex-column flex-lg-row"
        >
          <StatCard label="Servers" stat={guilds} loaded={isLoaded} />
          <StatCard label="Active Games" stat={activeGames} loaded={isLoaded} />
        </div>
      );
    }
  }
}

function StatCard(props) {
  return (
    <div className="stat-card p-3 p-lg-5 pb-0">
      <div className="stat-data">
        <div className={props.loaded ? "fadeIn" : "fadeOut"}>{props.stat}</div>
      </div>
      <div className="stat-label">{props.label}</div>
    </div>
  );
}