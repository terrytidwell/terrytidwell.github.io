let GUESS = {
    HIDDEN: 11,
    BOMB: 9,
    NOT_BOMB: 10,
};

let create_board_from_grid = (grid_squares) => {
    let board = [];
    for (let grid_line of grid_squares) {
        let board_line = [];
        for (let square of grid_line) {
            board_line.push({
                x: square.data.values.x,
                y: square.data.values.y,
                guess: GUESS.HIDDEN,
                hidden_mine: square.data.values.hidden_mine
            });
        }
        board.push(board_line);
    }
    return board;
};

let solve = (board) => {
    let action_base = (square, action) => {
        let x = square.x;
        let y = square.y;
        for (let d of [[-1, -1], [-1, 0], [-1, 1],
            [0, -1],[0, 1],
            [1, -1],[1, 0],[1, 1]]) {
            let dx = d[0];
            let dy = d[1];
            if (x + dx >= 0 && x + dx < SCREEN_COLUMNS &&
                y + dy >= 0 && y + dy < SCREEN_ROWS) {
                action(board[x+dx][y+dy]);
            }
        }
    };

    let find_adjacent_to_revealed = (square) => {
        return 0 < counter_base(square, (other_square) => {
            return (square.x === other_square.x ||
                square.y === other_square.y) &&
                other_square.guess >= 0 && other_square.guess <= 8;
        });
    };

    let counter_base = (square, condition) => {
        let sum = 0;
        action_base(square,(square) => {
            if (condition(square)) {
                sum++;
            }});
        return sum;
    };

    let find_value = (square) => {
        return counter_base(square, (square) => {
            return square.hidden_mine });
    };
    let find_current_count = (square) => {
        return counter_base(square, (square) => {
            return square.guess === GUESS.BOMB; });
    };
    let find_open_squares = (square) => {
        return counter_base(square, (square) => {
            return square.guess === GUESS.HIDDEN; });
    };
    let find_border_squares = (square) => {
        return 0 < counter_base(square, (square) => {
            return square.guess >= 0 &&
                square.guess <= 8;
        });
    };

    let reveal_square = (square) => {
        square.guess = square.hidden_mine ? GUESS.BOMB : find_value(square);
    };

    reveal_square(board[3][0]);

    let check_legality = () => {
        for (let grid_line of board) {
            for (let square of grid_line) {
                if (square.guess >= 0 &&
                    square.guess <= 8) {
                    let current = find_current_count(square);
                    if (current > square.guess) {
                        return false;
                    }
                    let empty = find_open_squares(square);
                    if (current + empty < square.guess) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    let expand_squares = () => {
        let square_added = true;
        let expanded = false;
        while (square_added) {
            square_added = propagate_literals();
            for (let grid_line of board) {
                for (let square of grid_line) {
                    if (square.guess === GUESS.NOT_BOMB &&
                        find_adjacent_to_revealed(square)) {
                        reveal_square(square);
                        square_added = true;
                        expanded = true;
                    }
                }
            }
        }
        return expanded;
    };

    let propagate_literals = () => {
        let literals_flipped = false;
        for (let grid_line of board) {
            for (let square of grid_line) {
                if (square.guess >= 0 &&
                    square.guess <= 8) {
                    let current = find_current_count(square);
                    if (current === square.guess) {
                        action_base(square, (square) => {
                            if (square.guess === GUESS.HIDDEN) {
                                literals_flipped = true;
                                square.guess = GUESS.NOT_BOMB;
                            }
                        });
                    }
                    let empty = find_open_squares(square);
                    if (current + empty === square.guess) {
                        action_base(square, (square) => {
                            if (square.guess === GUESS.HIDDEN) {
                                square.guess = GUESS.BOMB;
                                literals_flipped = true;
                            }
                        });
                    }
                }
            }
        }
        return literals_flipped;
    };

    let find_solution = (set) => {
        let get_first_unassigned = (set) => {
            for (let square of set) {
                if (square.guess === GUESS.HIDDEN) {
                    return square;
                }
            }
            return null;
        };

        let revert = [];
        for (let square of set) {
            revert.push(square.guess);
        }

        let inner_find_solution = () => {
            let legal = check_legality();
            if (!legal) {
                return legal;
            }
            propagate_literals();
            let next = get_first_unassigned(set);
            if (!next) {
                return check_legality();
            }
            next.guess = GUESS.BOMB;
            if (find_solution(set)) {
                return true;
            };
            next.guess = GUESS.NOT_BOMB;
            if (find_solution(set)) {
                return true;
            }
            return false;
        };
        let solved = inner_find_solution();
        if (!solved) {
            for (let x = 0; x < revert.length; x++) {
                set[x].guess = revert[x];
            }
        }
        return solved;
    };

    let find_invariants = () => {
        let search_grid = [];
        for (let grid_line of board) {
            for (let square of grid_line) {
                if (square.guess === GUESS.HIDDEN &&
                    find_border_squares(square)) {
                    search_grid.push(square);
                }
            }
        }
        if(search_grid.length === 0) {
            return;
        }

        let test_candidate_in_set = (index, set) => {
            let candidate = set[index];
            let search_grid = [];
            for (let x = 0; x < set.length; x++) {
                if (x !== index) {
                    search_grid.push(set[x]);
                }
            }
            let revert = [];
            for (let square of search_grid) {
                revert.push(square.guess);
            }
            candidate.guess = GUESS.BOMB;
            if (!find_solution(search_grid)) {
                candidate.guess = GUESS.NOT_BOMB;
                return;
            }
            for (let x = 0; x < revert.length; x++) {
                search_grid[x].guess = revert[x];
            }
            candidate.guess = GUESS.NOT_BOMB;
            if (!find_solution(search_grid)) {
                candidate.guess = GUESS.BOMB;
                return;
            }
            for (let x = 0; x < revert.length; x++) {
                search_grid[x].guess = revert[x];
            }
            candidate.guess = GUESS.HIDDEN;
            return;
        };

        for (let x = 0; x < search_grid.length; x++) {
            test_candidate_in_set(x, search_grid);
        }

    };

    let generations = 0;

    let solution_statistics = {};

    while(expand_squares()) {
        find_invariants();
        generations++;
        if (board[3][11].guess >= 0 &&
            board[3][11].guess <= 8) {
            if (!solution_statistics.exit_generation) {
                solution_statistics.exit_generation = generations;
            }
        }
    };
    solution_statistics.board = board;
    solution_statistics.total_generations = generations;
    solution_statistics.total_zeroes = 0;
    for (let grid_line of board) {
        for (let square of grid_line) {
            if (square.guess === 0) {
                solution_statistics.total_zeroes++;
            }
        }
    }
    return solution_statistics;
};

let set_board = (board, grid_squares) => {
    let guess_to_text = (guess) => {
        return ['0', '1', '2', '3', '4', '5',
            '6', '7', '8', 'M', '-', '?'][guess];
    };
    let set_guess = (square, guess) => {
        square.data.values.text.setVisible(true);
        square.data.values.text.setText(guess_to_text(guess));
    }
    for (let grid_line of grid_squares) {
        for (let square of grid_line) {
            let board_square =
                board[square.data.values.x][square.data.values.y];
            set_guess(square, board_square.guess);
            square.data.values.hidden_mine = board_square.hidden_mine;
            square.data.values.flag.setVisible(board_square.hidden_mine);
            square.data.values.flag.play('flag_blowing');
            //square.data.values.text.setVisible(!board_square.hidden_mine);
        }
    }
}

let make_randomized_board = () => {
    let board = [];
    for (let x = 0; x < SCREEN_COLUMNS; x++) {
        let board_line = [];
        for (let y = 0; y < SCREEN_ROWS; y++) {
            board_line.push({
                x: x,
                y: y,
                guess: GUESS.HIDDEN,
                hidden_mine: Phaser.Math.Between(0,100) < 20,
            });
        }
        board.push(board_line);
    }
    return board;
};

let solve_and_take_best = () => {
    let best_solution = null;
    for (let x = 0; x < 200; x++) {
        let board = make_randomized_board();
        let solution = solve(board);
        if (!best_solution || !best_solution.exit_generation) {
            best_solution = solution;
        } else {
            if (solution.exit_generation) {
                if (solution.exit_generation >= best_solution.exit_generation) {
                    if ((solution.exit_generation > best_solution.exit_generation) ||
                        (solution.exit_generation === best_solution.exit_generation &&
                            solution.total_zeroes <= best_solution.total_zeroes)) {
                        best_solution = solution;
                    }
                }
            }
        }
    }
    return best_solution;
};