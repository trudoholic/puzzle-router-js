import React from "react";
import {getRandomInt} from "./helper.js";
import {SlidingGameConfig, getCorrectPuzzle} from "./config.js";
import PropTypes from 'prop-types';

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerName: "",
      puzzle: [1, 2, 3, 4, 5, 6, 7, 0, 8],
      step: 0,
      isWin: false,
      isGameStart: false
    };
    this.emptyPiece = 0;
    this.handleName = this.handleName.bind(this);
    this.movePiece = this.movePiece.bind(this);
    this.shuffle = this.shuffle.bind(this);
    this.isAnswerCorrect = this.isAnswerCorrect.bind(this);
    this.checkPossibleMove = this.checkPossibleMove.bind(this);
    this.swapPiece = this.swapPiece.bind(this);
    this.startGame = this.startGame.bind(this);
    this.goEasyMode = this.goEasyMode.bind(this);
  }
  handleName(e) {
    this.setState({playerName: e.currentTarget.value});
  }
  movePiece(targetIndex) {
    let emptyIndex = this.state.puzzle.findIndex(piece => piece === 0);

    // base case
    if (targetIndex === emptyIndex) return;

    if (this.checkPossibleMove(targetIndex)) {
      this.swapPiece(targetIndex, emptyIndex);
    }
  }
  swapPiece(targetIndex, emptyIndex) {
    let swapped = this.state.puzzle.slice(0);

    // swap current piece and emptyPiece
    [swapped[targetIndex], swapped[emptyIndex]] = [
      swapped[emptyIndex],
      swapped[targetIndex]
    ];

    // check if answer is correct after swapped
    if (this.isAnswerCorrect(swapped)) {
      this.setState({isWin: true, isGameStart: false});
      let player = {};
      player.name = this.state.playerName;
      player.step = this.state.step + 1;
      this.props.updateRanking(player);
    }

    this.setState({puzzle: swapped, step: this.state.step + 1});
  }
  checkPossibleMove(targetIndex) {
    let emptyIndex = this.state.puzzle.findIndex(
      piece => piece === this.emptyPiece,
    );

    let boardRowNum = Math.sqrt(SlidingGameConfig.blocks);

    // check if in same row, then check if in the same column;
    // piece in the same column should have same remaining, in the same row should have
    // same quotient
    return (
      (Math.abs(targetIndex - emptyIndex) === boardRowNum &&
        targetIndex % boardRowNum === emptyIndex % boardRowNum) ||
      (Math.abs(targetIndex - emptyIndex) === 1 &&
        Math.floor(targetIndex / boardRowNum) ===
        Math.floor(emptyIndex / boardRowNum))
    );
  }
  shuffle() {
    let shuffleTimes = 1000;

    // make sure they are swapped even times
    let swapTimes = Math.floor(Math.random() * shuffleTimes) * 2,
      puzzle = getCorrectPuzzle(),
      i = 0;

    while (i < swapTimes) {
      // handle swap boundary;
      let randomIndex = getRandomInt(1, SlidingGameConfig.blocks - 1);
      let
        // prev = puzzle[randomIndex - 1],
        current = puzzle[randomIndex];

      // swap two adjacent piece
      puzzle[randomIndex] = puzzle[randomIndex - 1];
      // puzzle[randomIndex] = prev;
      puzzle[randomIndex - 1] = current;

      i++;
    }
    this.setState({puzzle: puzzle});
  }
  isAnswerCorrect(puzzle) {
    return (
      puzzle
        .slice(0, SlidingGameConfig.blocks - 1)
        .filter((piece, index) => +piece !== index + 1).length === 0
    );
  }
  startGame(mode) {

    // reset state
    this.setState({isGameStart: true, isWin: false, step: 0});

    if (mode === "easy") {
      this.goEasyMode();
    } else {
      this.shuffle();
    }
  }
  goEasyMode() {
    this.setState({puzzle: [1, 2, 3, 4, 5, 6, 7, 0, 8]});
  }

  render() {
    let puzzle = this.state.puzzle.map((num, index) => (
      <div key={index} onClick={() => this.movePiece(index)}>
        <span> {num !== this.emptyPiece ? num : ""} </span>
      </div>
    ));
    let disable = !this.state.playerName.length || this.state.isGameStart;
    return (
      <div>
        <input
          value={this.state.playerName}
          onChange={this.handleName}
          disabled={this.state.isGameStart}
          placeholder="You name"
        />
        <button
          disabled={disable}
          onClick={() => this.startGame("hard")}>
          Start
        </button>
        <button
          disabled={disable}
          onClick={() => this.startGame("easy")}>
          Easy
        </button>

        <div className="step">Step: {this.state.step}</div>
        <section className={this.state.isGameStart ? "game-on" : ""}>
          <div className="puzzle"> {puzzle}</div>
          <div className="overlay"> </div>

          <div className={this.state.isWin ? "ko" : "not-ko"}>
            <div className="ko-wrapper">
              <div className="large">KO</div>
              <div>Ranking</div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

Game.propTypes = {
  updateRanking: PropTypes.func.isRequired,
}
