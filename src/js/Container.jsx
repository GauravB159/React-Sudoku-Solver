import React from 'react';
import ReactDOM from 'react-dom';
import parse from 'csv-parse';
import axios from 'axios'; 

export default class Board extends React.Component{
  constructor(props){
    super(props);
    this.state={
      rows: [],
      values:[]
    }
  }
  componentDidMount(){
    let rows = this.state.rows;
    axios.get("/data/values.csv").then((response)=>{
      parse(response.data,{},(err, output)=>{
        for(let i = 0; i < 3; i++){
          rows.push(i)
        }
        this.setState({
          values: output
        });
        setTimeout(()=>{
          this.solveSudoku(output,0,0,(grid)=>{
            this.setState({
              values:grid
            })
          })
        },1000)
      });
    }).catch((error)=>{
      console.log(error);
    }) 
    this.setState({
      rows: rows
    })
  }
  
  solveSudoku(grid,row, col, solved) {
    let cell = this.findUnassignedLocation(grid, row, col);
    row = cell[0];
    col = cell[1];
    if (row === -1) {
        solved(grid);
        return true;
    }
    for (let num = 1; num <= 9; num++) {
        if ( this.noConflicts(grid, row, col, num) ) {   
            grid[row][col] = num;
            if ( this.solveSudoku(grid, row, col, solved) ) {   
              return true;
            }
            grid[row][col] = 0;
        }
    }
    return false;
  }


  findUnassignedLocation(grid, row, col) {
    for (; row < 9 ; col = 0, row++)
        for (; col < 9 ; col++)
            if (grid[row][col] == 0)
                return [row, col];
    return [-1, -1];
  }
  noConflicts(grid, row, col, num) {
      return this.isRowOk(grid, row, num) && this.isColOk(grid, col, num) && this.isBoxOk(grid, row, col, num);
  }

  isRowOk(grid, row, num) {
      for (let col = 0; col < 9; col++)
          if (grid[row][col] == num)
              return false;

      return true;
  }
  isColOk(grid, col, num) {
      for (let row = 0; row < 9; row++)
      if (grid[row][col] == num)
          return false;
      return true;    
  }
  isBoxOk(grid, row, col, num) {
      row = Math.floor(row / 3) * 3;
      col = Math.floor(col / 3) * 3;
      for (let r = 0; r < 3; r++)
          for (let c = 0; c < 3; c++)
              if (grid[row + r][col + c] == num)
                  return false;
      return true;
  }

  render(){
    return(
      <div className="board">
        {
          this.state.rows.map((sq,i)=>{
            return(<SquareRow values={this.state.values} index={sq}/>);
          })
        }
      </div>
    )
  }
}

class SquareRow extends React.Component{
  constructor(props){
    super(props);
    this.state={
      squares: []
    }
  }
  render(){
    let squares = [];
    let values = [];
    let index = this.props.index;
    for(let i = 0;i< 3;i++){
      values.push([])
      for(let j = 0; j < 3;j++){
        for(let k = 0; k< 3;k++)
        {
          values[i].push(this.props.values[index*3+j][i*3+k])
        }
      }
    }
    for(let i = 0; i < 3; i++){
      squares.push(<Square values={values[i]}/>)
    }
    return(
      <div className="square-row">
        {
          squares.map((sq,i)=>{
            return sq;
          })
        }
      </div>
    )
  }
}

class Square extends React.Component{
  constructor(props){
    super(props);
    this.state={
      cells:[]
    }
  }

  render(){
    let cells = [];
    for(let i = 0; i < 3; i++){
      cells.push([]);
      for(let j = 0;j< 3;j++){
        cells[i].push(<Cell value={this.props.values[i*3+j]} />)
      }
    }
    return(
      <div className="square">
        {
          cells.map((row, i)=>{
            return(
              <div className="row">
                {
                  row.map((cell,i)=>{
                    return cell
                  })
                }
              </div>
            )
          })
        }
      </div>
    )
  }
}

class Cell extends React.Component{
  constructor(props){
    super(props);
    this.state={
      value:" "
    }
  }
  componentWillMount(){
    this.setState({
      premade:  this.props.value === "0" ? false : true
    });
  }
  render(){
    return(
      <div className="cell" id={this.state.premade ? "premade" : "nonpremade" }>{this.props.value === "0" ? " " : this.props.value}</div>
    )
  }
}

