# Simulador de Deadlocks

Este simulador permite modelar, visualizar y experimentar escenarios de interbloqueos (deadlocks) en sistemas operativos: procesos, recursos, matrices y grafo de asignación. Incluye estrategias de deteccion, prevención y evitación, además de resúmenes y ayudas visuales.

La finalidad es que puedas tener una idea representativa de como internamente se forman los deadlocks y como las distintas estrategias lo resuelven (o manejan).

## Vista previa

<img width="1920" height="959" alt="image" src="https://github.com/user-attachments/assets/1482c9be-3f9c-4e34-9e3d-69e58aad3462" />

## Requisitos
-Git instalado
-Node.js LTS 20

## Instalación
1. Clona este repositorio:  git clone https://github.com/usuario/simulador-deadlocks.git
2. Navega a la carpeta central: cd simuladorDeadlock
3. Ejecuta npm install
4. Ejecuta npm run dev y listo

## Uso
1. Define los procesos y recursos para generar deadlocks.
2. Observa como se genera el deadock segun lo que se definió en el paso 1
3. Selecciona una estrategia de manejo (detección, prevención, evitación).
4. Observa la evolución del sistema en el grafo y los resultados finales.

## Ejemplo de uso
-Definir recursos y 4 procesos que generan deadlocks
<img width="1920" height="952" alt="image" src="https://github.com/user-attachments/assets/fe1ced2f-17b8-4edf-83b3-53afb5e5dbfc" />

-Observar asignacion de recursos hasta la ocurrencia del deadlocks
<img width="1920" height="953" alt="image" src="https://github.com/user-attachments/assets/7d7321b5-9e99-4343-849f-cebff2dac742" />

-Ver grafo de asignación (deadlock presente)
<img width="1920" height="954" alt="image" src="https://github.com/user-attachments/assets/49e3fa0d-198e-4238-b534-d735a0ed0163" />

-Seleccionar estrategia de manejo y ver resultados
<img width="1920" height="955" alt="image" src="https://github.com/user-attachments/assets/a7cb9713-6815-4630-acaa-cd0df39103a7" />


