/* =============================================================================
==                                                                            ==
==                      -------   ASTEROIDS   ------                          ==
==                                                                            ==
==                                                                            ==
==   Álvaro Moles Vinader                                                     ==
==   Gráficos y Visualiazación en 3D                                          ==
==   Grado en Ingeniería en Sistemas Audiovisuales y Multimedia               ==
==   a.moles@alumnos.urjc.es                                                  ==
==============================================================================*/
var canvas;
var ctx;
var shapes = []; // Array de figuras
var level = 0;
var points = 0;
var lives = 3;
var maxPoints = 3; // Puntuación máxima para el nivel 0
var asterInterval = 4; // Intervalo inicial de salida de asteroides (seg)
var astV = 0.1; // Velocidad inicial de los asteroides
var initDate = new Date();
var initTime; // Tiempo de inicio de juego
var before; // Para el contador de tiempo de lanzamiento de asteroides
var gameTime; // Para el contador de tiempo de juego
var interval;
var pi = Math.PI;

/* ------------------------  Constructor triángulo ---------------------------*/
// Dibuja y actualiza la posición de un objeto "triángulo" orientado en el eje X.
function Triangle (id, x, y, distToCentX, distToCentY, color, v, theta) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.distToCentX = distToCentX;
  this.distToCentY = distToCentY;
  this.color = color;
  this.v = v; // Velocidad de avance inicial
  this.theta = theta; // Ángulo inicial (rad)
  this.w = 0.0; // Velocidad de giro inicial (rad / seg)

  // Asignación de tiempo actual
  var d = new Date();
	this.t = d.getTime();

  // Método para actualizar la posición del triángulo
  this.update = function() {

    // Evaluación de tiempo
		var d = new Date();
		var now = d.getTime();
		var dt = now - this.t;

    // Actualización de parámetros
		this.t = now;
		this.theta += this.w * (dt/1000.0);
    this.x += this.v * Math.cos(this.theta) * dt;
    this.y += this.v * Math.sin(this.theta) * dt;

    // Salida de la pantalla
    if (this.x > canvas.width + this.distToCentX) { // Salida por la derecha
      this.x = -this.distToCentX; // Retorno por la izquierda
    } else if (this.x < -this.distToCentX) { // Salida por la izquierda
      this.x = canvas.width + this.distToCentX; // Retorno por la derecha
    } else if (this.y > canvas.height + this.distToCentY) { // Salida por abajo
      this.y = -this.distToCentY; // Retorno por arriba
    } else if (this.y < -this.distToCentY) { // Salida por arriba
      this.y = canvas.height + this.distToCentY; // Retorno por abajo
    }

    // Comparar distancia con asteroides
    for (var i in shapes) {
      if (shapes[i].id === 'aster') {
        var distToAster = Math.sqrt( (shapes[i].x - this.x) * (shapes[i].x - this.x) +
                                     (shapes[i].y - this.y) * (shapes[i].y - this.y) );

        // Colisión con asteroide
        if (distToAster < (shapes[i].distToCentX + this.distToCentX)) {

          // Eliminar asteroide
          shapes[i].id = 'empty';

          // Retorno de nave al punto inicial
          this.x = (canvas.width / 2)
          this.y = (canvas.height / 2)
          this.v = 0.0;
          this.w = 0.0; // (rad/seg)
          this.theta = 0.0; // (rad)

          // Disminuir vida
          lives -= 1;

          // Evaluar fin de vidas
          if (lives === 0) {
            for (var j in shapes) {
              shapes[j].id = 'empty'; // Eliminar todas las figuras
            }
            clearInterval(interval); // Detener renderizado
            alert('game over! (no lives)') // Mostrar mensaje
          }

          // Detener bucle
          break;
        }
      }
    }
	}

  // Método para dibujar el triángulo
	this.draw = function() {

    // Salvar el contexto
		ctx.save();

    // Traslación, rotación y escalado del triángulo
		ctx.translate(this.x, this.y);
		ctx.rotate(this.theta);
		ctx.scale(this.distToCentX, this.distToCentY);

    // Trazado del triángulo
		ctx.beginPath();
		ctx.moveTo(1.0, 0.0); // Punto inicial en (1,0) - punta de la nave en eje "x" -
		ctx.lineTo(-1.0, 1.0); // Dibujar línea del punto inicial al (-1,0)
		ctx.lineTo(-1.0, -1.0); // Dibujar línea del punto inicial al (-1,-1)
		ctx.closePath();

    // Relleno del triángulo
		ctx.fillStyle = this.color;
    ctx.fill();

    // Recuper el contexto
		ctx.restore();
	}
}

/* ---------------------- Constructor elipse / círculo -----------------------*/
// Dibuja y actualiza la posición de un objeto "elipse / círculo"
function Ellipse(id, x, y, distToCentX, distToCentY, color, v, theta) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.distToCentX = distToCentX;
  this.distToCentY = distToCentY;
  this.color = color;
  this.v = v;
  this.theta = theta;

  // Asignación de tiempo actual
  var d = new Date();
	this.t = d.getTime();

  // Método para actualizar la posición del círculo
  this.update = function() {

    // Evaluar tiempo actual
		var d = new Date();
		var now = d.getTime();
		var dt = now - this.t; // Incremento de tiempo

    // Actualización de parámetros
    this.t = now;
    this.x += this.v * Math.cos(this.theta) * dt;
    this.y += this.v * Math.sin(this.theta) * dt;

    // Salida de pantalla
    if (this.x > canvas.width + this.distToCentX || this.x < -this.distToCentX ||
        this.y > canvas.height + this.distToCentY || this.y < -this.distToCentY) {
      this.id = 'empty'; /* Eliminar figura del array (función "drawShapes" no dibuja
                          figuras con id = 'empty') */
    }
  }

  // Método para dibujar el círculo
  this.draw = function() {

    // Salvar el contexto
  	ctx.save();

    // Traslación, rotación y escalado del círculo
  	ctx.translate(this.x, this.y);
    ctx.rotate(this.theta);
    ctx.scale(this.distToCentX, this.distToCentY);

    // Trazado del círculo
    ctx.beginPath();
    ctx.arc(0.0, 0.0, 1.0, 0, 2 * pi, false);

    // Relleno del círculo
    ctx.fillStyle = this.color;
    ctx.fill();

    // Recuper el contexto
    ctx.restore();
  }
}

/* ------------------- Constructor rectángulo / cuadrado ---------------------*/
// Dibuja y actualiza la posición de un objeto "rectángulo / cuadrado"
function Rectangle(id, x, y, distToCentX, distToCentY, color, v, theta) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.distToCentX = distToCentX;
  this.distToCentY = distToCentY;
  this.color = color;
  this.v = v;
  this.theta = theta; // (rad)

  // Asignar tiempo actual
  var d = new Date();
	this.t = d.getTime();

  // Método para actualizar la posición del rectángulo
  this.update = function() {

    // Evaluación de tiempo actual
    var d = new Date();
    var now = d.getTime();
    var dt = now - this.t; // Incremento de tiempo

    // Actualización de parámetros
		this.t = now;
    this.x += this.v * Math.cos(this.theta) * dt;
    this.y += this.v * Math.sin(this.theta) * dt;

    // Salida de pantalla
    if (this.x > canvas.width + this.distToCentX || this.x < -this.distToCentX ||
        this.y > canvas.height + this.distToCentY || this.y < -this.distToCentY) {
      this.id = 'empty'; /* Eliminar figura del array (función drawShapes no dibuja
                          figuras con id = 'empty') */
    }

    // Comparar distancia con asteroides
    for (var i in shapes) {
      if (shapes[i].id === 'aster') {
        var distToAster = Math.sqrt( (shapes[i].x - this.x) * (shapes[i].x - this.x) +
                                     (shapes[i].y - this.y) * (shapes[i].y - this.y) );

        if (distToAster < (shapes[i].distToCentX + this.distToCentX) ) {
          shapes[i].id = 'empty'; // Eliminar asteroide
          this.id = 'empty'; // Eliminar disparo
          points += 1;

          // Detener bucle
          break;
        }
      }
    }
  }

  // Método para dibujar el rectángulo
  this.draw = function() {

    // Salvar el contexto
    ctx.save();

    // Traslación, rotación y escalado del rectángulo
    ctx.translate(this.x, this.y);
    ctx.rotate(this.theta);
    ctx.scale(this.distToCentX, this.distToCentY);

    // Color del rectángulo
    ctx.fillStyle = this.color;

    // Trazado del rectángulo
    ctx.beginPath();
    ctx.fillRect(0.0, 0.0, 1.0, 1.0);
    ctx.fill();

    // Recuper el contexto
    ctx.restore();
  }
}

/* ----------------------- Función dibujar figuras -------------------------- */
function drawShapes() {

  // Limpiar el canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar fondo negro
  ctx.fillStyle = 'rgba(0,0,0,1.0)';
  ctx.beginPath();
  ctx.fillRect(0.0, 0.0, canvas.width, canvas.height);
  ctx.fill();

  // Actualizar posición y dibujar todas las figuras (no eliminadas) en su nueva posición
  for(var i in shapes) {
    if (shapes[i].id != 'empty') {
        shapes[i].update();
        shapes[i].draw();
      }
    }

  // Dibujar rectángulo para el marcador
  ctx.fillStyle = 'rgba(50, 150, 50, 1.0)';
  ctx.beginPath();
  ctx.fillRect(5, 5, 350, 20);
  ctx.fill();

  // Mostrar marcador
  ctx.font = '14pt Arial';
  ctx.fillStyle = 'black';
  ctx.fillText('level: ' + level + '     points: ' + points + '     lives: '
               + lives + '     time: ' + gameTime, 10, 20);
}

/* -----------------------------------------------------------------------------
                              Función de renderizado
------------------------------------------------------------------------------*/
function render() {

  // Tiempo límite de juego
  var timeLimit = '180'; // (seg)

  // Dibujar todas las figuras del array en su nueva posición
  drawShapes();

  // Evaluar tiempo
  var d = new Date();
  var now = d.getTime();
  gameTime = ((now - initTime) / 1000.0).toFixed(0);
  var asterTime = ((now - before) / 1000.0).toFixed(0);

  // Evaluar contador de tiempo del juego
  if (gameTime == timeLimit) {
    for (var j in shapes) {
      shapes[j].id = 'empty'; // Eliminar todas las figuras
    }
    clearInterval(interval); // Detener renderizado
    alert('game over! (time limit)') // Mostrar mensaje
  }

  // Evaluar contador de tiempo para el lanzamiento de asteroides
  if (asterTime == asterInterval) {

    /*---------------------- Crear objeto asteroide ------------------------- */
    // Parámetros asteroide
    var astID = 'aster';
    var maxRadious = 25;
    var minRadious = 10;
    var astColor = 'rgba(255,60,0,1.0)';

    // Asignar radio del asteroide de forma aleatoria
    var astRadious = (Math.random() * (maxRadious - minRadious)) + minRadious;
    var astDistToCentX = astRadious;
    var astDistToCentY = astDistToCentX;

    // Crear coordenadas y ángulo iniciales del asteroide
    var astPosX;
    var astPosY;
    var maxAngle;
    var minAngle;
    var maxX = canvas.width + astRadious;
    var minX = -astRadious;
    var maxY = canvas.height + astRadious;
    var minY = -astRadious;
    var randNumber = Math.round(Math.random() * 3); // Numero aleatorio del 0 al 3
    switch (randNumber) {
      case 0:
        // Entrada desde parte izquierda del canvas
        maxAngle = pi / 4; // (rad)
        minAngle = - pi / 4; // (rad)
        astPosX = minX;
        astPosY = Math.round( (Math.random() * (maxY - minY)) + minY);
        break;
      case 1:
        // Entrada desde parde derecha del canvas
        maxAngle = 5 * (pi / 4); // (rad)
        minAngle = 3 * (pi / 4); // (rad)
        astPosX = maxX;
        astPosY = Math.round( (Math.random() * (maxY - minY) ) + minY);
        break;
      case 2:
        // Entrada desde parte superior del canvas
        maxAngle = 3 * (pi / 4); // (rad)
        minAngle = pi / 4; // (rad)
        astPosX = Math.round( (Math.random() * (maxX - minX) ) + minX);
        astPosY = minY;
        break;
      case 3:
        // Entrada desde parte inferior del canvas
        maxAngle = 7 * (pi / 4); // (rad)
        minAngle = 5 *  (pi / 4); // (rad)
        astPosX = Math.round( (Math.random() * (maxX - minX) ) + minX);
        astPosY = maxY;
        break;
    }
    var astAngle = (Math.random() * (maxAngle - minAngle)) + minAngle;

    // Crear nuevo objeto "asteroide" y almacenarlo en el array de figuras
    shapes.push(new Ellipse(astID, astPosX, astPosY, astDistToCentX,
                astDistToCentY, astColor, astV, astAngle)); // Añadir posición al array

    // Resetear contador de tiempo
    before = now;
  }

  // Nivel superado
  if (points === maxPoints) {
    points = 0; // Reseteo de puntos
    level += 1;  // Incremento de nivel
    maxPoints += 2; // Incremnto de la puntuación máxima
    astV += 0.01; // Incremento de la velocidad de los asteroides

    if (asterInterval > 0) {
      asterInterval -= 1; // Reducir intervalo de tiempo de entrada de asteroides
    }
    // Juego completado
    if (level === 4) {
      for (var j in shapes) {
        shapes[j].id = 'empty'; // Eliminar todas las figuras
      }
      clearInterval(interval); // Detener renderizado
      alert('WIN !!'); // Mostrar mensaje
    }

  }
}

/* --------------------------Función obtener figura---------------------------*/
// Devuelve la figura con el identificador "id", del array de figuras
function getShape(id) {
  for(var i in shapes) {
    if(shapes[i].id === id)
      return shapes[i];
  }
}

/* ------------------------Función manejador teclado--------------------------*/
// Asigna instrucciones a los diferentes eventos de teclado
function keyHandler(event) {

  // Obtener nave del array de figuras
  var ship;
  ship = getShape('ship');

  // Analizar eventos de teclado
  switch(event.key) {
    case "ArrowLeft": // Girar a la izquierda
      ship.w -= 0.1;
      break;
    case "ArrowRight": // Girar a la derecha
      ship.w  += 0.1;
      break;
    case "ArrowUp": // Avanzar
      ship.v += 0.01;
      break;
    case "ArrowDown": // Retroceder
      ship.v -= 0.01;
      break;

    case "v": // Disparar

      // Parámetros disparo
      var shotID = 'shot';
      var shotPosX = ship.x; // Mismas coordenadas que la nave
      var shotPosY = ship.y;
      var shotDistToCentX = 15;
      var shotDistToCentY = shotDistToCentX / 2;
      var shotColor = 'rgba(255, 0, 0, 1.0)';
      var shotVel = 1.0;
      var shotAngle = ship.theta; // Mismo ángulo que la nave

      // Crear nuevo objeto "disparo" y almacenarlo en el array de figuras
      shapes.push(new Rectangle(shotID, shotPosX, shotPosY, shotDistToCentX,
                                shotDistToCentY, shotColor, shotVel, shotAngle));
                                // Añadir posición al array
      break;

    default: // Tecla no configurada
      console.log("Key not handled");
  }
}

/* -----------------------------------------------------------------------------
                              Función principal
------------------------------------------------------------------------------*/
function main () {

  alert("                ASTEROIDS             \n" +
        "                                      \n" +
        " upwards arrow    --> move forward    \n" +
        " downwards arrow  --> move back       \n" +
        " leftwards arrow  --> turn left       \n" +
        " rightwards arrow --> turn right      \n" +
        "      v           --> shoot           \n" +
        "                                      \n" +
        " time: 3 minutes                      \n"  +
        " levels: 4                              ")

  initDate = new Date();
  initTime = initDate.getTime(); // Tiempo de inicio de juego
  before = initTime; // Para el contador de tiempo de lanzamiento de asteroides
  gameTime = initTime; // Para el contador de tiempo de juego

  // Tiempo de renderizado
  var renderTime = 30; // (ms)

  // Dibujar canvas
  canvas = document.getElementById('canvas');
  if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return false;
	}
  ctx = canvas.getContext('2d');

  // Parámetros de la nave espacial
  var shipID = 'ship';
  var shipPosX = (canvas.width / 2);
  var shipPosY = (canvas.height / 2);
  var shipDistToCentX = 20;
  var shipDistToCentY = shipDistToCentX;
  var shipColor = 'rgba(80, 80, 255, 1.0)';
  var shipVel = 0.0;
  var shipAngle = 0.0; // (rad)

  // Crear nuevo objeto "nave" y almacenarlo en el array de figuras
  shapes.push(new Triangle(shipID, shipPosX, shipPosY, shipDistToCentX,
                           shipDistToCentY, shipColor, shipVel, shipAngle));
                           /* En este momento el array de figuras está vacío,
                           la nave es la primera figura que se almacena */

  // Analizar eventos de teclado
  document.addEventListener('keydown', keyHandler, false);

  // Renderizar imagen
  interval = setInterval(render, renderTime);

}
