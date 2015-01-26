{
    init: function(elevators, floors) {
         
        var up = [];
        var down = [];
        var idleElevators = [];
        _.each(elevators,function(elevator){
            
            elevator.on("idle", function() {
            // The elevator is idle, so let's go to all the floors (or did we forget one?)
                elevator.goingUpIndicator(true);
                elevator.goingDownIndicator(true);
                /*for(var L = 0; L<up.length;L++){
                    if(up[L] || down[L]){
                        elevator.goToFloor(L);
                        return;
                    }
                }*/
                idleElevators.push(elevator);
                //elevator.goToFloor(Math.floor(Math.random()*elevators.length));
            });

            elevator.on("floor_button_pressed", function(floorNum){
                
                elevator.goToFloor(floorNum);
                elevator.destinationQueue.sort(function(a,b){return a-b});
                if(elevator.destinationQueue.length >0 && elevator.destinationQueue[0]<elevator.currentFloor()){
                    elevator.destinationQueue.reverse();
                    //elevator.goingUpIndicator(true);
                    //elevator.goingDownIndicator(false);
                }
                else{
                    //elevator.goingUpIndicator(false);
                    //elevator.goingDownIndicator(true);
                }
                elevator.checkDestinationQueue();
            });

            elevator.on("passing_floor", function(floorNum,direction){
                
                if(direction=="up"){
                    if(up[floorNum] && elevator.loadFactor()<1.0){
                        elevator.goToFloor(floorNum, true);
                        elevator.goingUpIndicator(true);
                        elevator.goingDownIndicator(false);
                    }
                }
                if(direction=="down"){
                    if(down[floorNum] && elevator.loadFactor()<1.0){
                        elevator.goToFloor(floorNum, true);
                        elevator.goingUpIndicator(false);
                        elevator.goingDownIndicator(true);
                    }
                } 
                
            });

            elevator.on("stopped_at_floor", function(floorNum){
                up[floorNum]=false;
                down[floorNum]=false;
                
            });

        });
        _.each(floors, function(floor){
            up[floor.floorNum()] = false;
            down[floor.floorNum()] = false;
            floor.on("up_button_pressed", function(){
                up[floor.floorNum()] = true;
                if(idleElevators.length>0)
                {
                    var thisElv = idleElevators.pop();
                    thisElv.goToFloor(floor.floorNum());
                    thisElv.goingUpIndicator(true);
                    thisElv.goingDownIndicator(false);
                }
            });

            floor.on("down_button_pressed", function(){
                down[floor.floorNum()] = true;
                if(idleElevators.length>0)
                {
                    var thisElv = idleElevators.pop();
                    thisElv.goToFloor(floor.floorNum());
                    thisElv.goingUpIndicator(false);
                    thisElv.goingDownIndicator(true);
                }
            });
        });


        

    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}