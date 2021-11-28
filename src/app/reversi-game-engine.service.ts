import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Board, C, GameState, getEmptyBoard, PlayImpact, TileCoords, Turn } from './ReversiDefinitions';

@Injectable({
  providedIn: 'root'
})
export class ReversiGameEngineService {
  protected board!: Board; // Le suffice ! => https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator
  protected currentTurn: Turn = 'Player1';
  protected gameStateSubj: BehaviorSubject<GameState>;

  public readonly gameStateObs: Observable<GameState>;

  constructor() {
      this.initBoard();
      this.gameStateSubj = new BehaviorSubject<GameState>({
          board: this.board,
          turn: this.currentTurn
      });
      this.gameStateObs = this.gameStateSubj.asObservable();
  }


  initBoard(): void {
      this.board = getEmptyBoard();
      this.board[3][3] = this.board[4][4] = "Player2";
      this.board[3][4] = this.board[4][3] = "Player1";

      this.currentTurn = 'Player1';
  }


  PionsTakenIfPlayAt(x: number, y: number): PlayImpact {
      if (this.board[x]?.[y] !== 'Empty')
          return [];
      const adversaire: Turn = this.currentTurn === 'Player1' ? 'Player2' : 'Player1';
      // Parcourir les 8 directions pour accumuler les coordonnées de pions prenables
      return [ [1, 0], [1, -1], [1, 1], [0, 1], [0, -1], [-1, 0], [-1, -1], [-1, 1] ].reduce(
          (L, [dx, dy]) => {
              let c: C | undefined;
              let X = x, Y = y;
              let Ltmp: TileCoords[] = [];
              do {Ltmp.push( [X += dx, Y += dy] );
                  c = this.board[X]?.[Y];
              } while(c === adversaire);
              if (c === this.currentTurn && Ltmp.length > 1) {
                  Ltmp.pop(); // On en a pris un de trop...
                  L.push( ...Ltmp );
              }
              return L;
          },
          [] as TileCoords[]
      ); // fin reduce
  }

  play(i: number, j: number): void {
      // Vérifier que le coup est valide.
      // Si c'est le cas, après avoir jouer le coup, on passe à l'autre joueur.
      // Si l'autre joueur ne peut jouer nul part, on redonne la main au joueur initial.
      const L = this.PionsTakenIfPlayAt(i, j);
      if (L.length > 0) {
          [...L, [i, j]].forEach( ([x, y]) => this.board[x][y] = this.currentTurn );
          this.currentTurn = (this.currentTurn === 'Player1' ? 'Player2' : 'Player1');
          if (!this.canPlay()) {
              this.currentTurn = (this.currentTurn === 'Player1' ? 'Player2' : 'Player1');
          }
          this.gameStateSubj.next({
              turn: this.currentTurn,
              board: this.board
          });
      }
  }

  private canPlay(): boolean {
      return !!this.board.find(
          (L, i) => L.find( (_, j) => this.PionsTakenIfPlayAt(i, j).length > 0 )
      );
  }
}
