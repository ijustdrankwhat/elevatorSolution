{
    init: function(elevators, floors) {
         
        var up = [];
        var down = [];
        var requests = [];

        var newElevators = [];
        //var reqFilter = function(floor,)
        var request = function(floor,direction){
            var self = this;
            self.floor = floor;
            self.direction = direction;
            self.elv = null;    
            self.sendAnElevator = function(elevator){
                if(self.elv!=null){
                    //Remove item from the destination queue and commit it.  
                    self.elv.destinationQueue.splice(self.elv.destinationQueue.indexOf(floor));
                    self.elv.checkDestinationQueue();
                }
                elevator.goToFloor(self.floor);
                self.elv=elevator;
            }

            self.amICloser = function(elevator){
                //TODO: do some logic to see if the passed in elevator is more convenient than one already on the way.
            }
        }

        var Elevator = function(elevator, baseFloor){
            baseFloor= baseFloor || 0;
            var self = this;
            self.elevator = elevator;
            self.direction = "idle";
            self.prevFloor = 0;
            self.state = "idle";
            self.requests = [];
            self.isGoingTo = function(floorNum) {
                return self.elevator.destinationQueue.indexOf(floorNum) != -1;
            };

            self.isFull = function() {
                return self.elevator.loadFactor() > 0.4;
            };

            self.goToFloorScore = function(targetFloor, passengerDirection) {
                //alert("goToScore");
                if(self.state == "idle")
                    return Math.abs(self.elevator.currentFloor() - targetFloor);
                if(self.isFull())
                    return 10000;
                if(self.direction == "up"){
                    if(self.elevator.currentFloor < targetFloor)
                    {
                        return targetFloor - self.elevator.currentFloor();
                    }
                    else
                    {
                        return ((self.elevators.length +1) - currentFloor) +
                                ((self.elevators.length+1) -targetFloor) +
                                self.elevator.destinationQueue.length;
                    }
                }
                if(self.direction == "down"){
                    if(self.elevator.currentFloor > targetFloor)
                    {
                        return targetFloor - self.elevator.currentFloor() + self.elevator.destinationQueue.length;
                    }
                    else
                    {
                        return (currentFloor) +
                                (targetFloor) +
                                self.elevator.destinationQueue.length;
                    }
                }
                return 10000;

            };
            self.goToFloor = function(targetFloor){
                //alert("inGoTo");
                self.state = "InTransit";
                self.elevator.goToFloor(targetFloor);
            };

            self.elevator.on("idle", function() {
            // The elevator is idle, so let's go to all the floors (or did we forget one?)
                self.elevator.goingUpIndicator(true);
                self.elevator.goingDownIndicator(true);
                self.elevator.goToFloor(baseFloor);
            });

            self.elevator.on("floor_button_pressed", function(floorNum){
                self.goToFloor(floorNum);
                self.elevator.destinationQueue.sort(function(a,b){return a-b});
                if(self.elevator.destinationQueue.length >0 && self.elevator.destinationQueue[0]<elevator.currentFloor()){
                    self.elevator.destinationQueue.reverse();
                    //elevator.goingUpIndicator(true);
                    //elevator.goingDownIndicator(false);
                }
                else{
                    //elevator.goingUpIndicator(false);
                    //elevator.goingDownIndicator(true);
                }
                self.elevator.checkDestinationQueue();
            });

        };


        var findRightElevator = function(targetFloor, passengerDirection){
            var lowest = 1000000;
            var lowestElv = null;
            _.each(newElevators, function(elv){
                var score = elv.goToFloorScore(targetFloor, passengerDirection);
                //alert(score);
                if(score<lowest)
                {
                    lowest=score;
                    lowestElv = elv;
                }
            });
            //alert(lowestElv);
            return lowestElv;
        }

        
                    
        _.each(elevators,function(elevator){
            
            newElevators.push(new Elevator(elevator,0));
            //Math.floor(Math.random()*2)*8)
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
                /*
                if(direction=="up"){
                    if(up[floorNum] && elevator.loadFactor()<0.6){
                        elevator.goToFloor(floorNum, true);
                        elevator.goingUpIndicator(true);
                        elevator.goingDownIndicator(false);
                    }
                }
                if(direction=="down"){
                    if(down[floorNum] && elevator.loadFactor()<0.6){
                        elevator.goToFloor(floorNum, true);
                        elevator.goingUpIndicator(false);
                        elevator.goingDownIndicator(true);
                    }
                } */
                //THIS IS WHERE WE SHOULD CHECK AMICLOSER


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
                
                var filtered = requests.filter(function(req){
                    return req.floor == floor.floorNum() && req.direction == "up";
                });
                
                if(filtered.length>0){
                    //TODO: Do some calculation about whether or not there's a closer elevator than the one On The way
                }
                else{
                    var elv = findRightElevator(floor.floorNum(), "up");
                    elv.goToFloor(floor.floorNum());
                }
                
              //  var elv = findRightElevator(floor.floorNum(), "up");
              //  elv.goToFloor(floor.floorNum());
              //  requests.push(new request(floor.floorNum(),"up"));
                
                ////alert(elv.currentFloor);
                //alert(elv);
                
                //alert("afterGoTo");
                /*up[floor.floorNum()] = true;
                var idle = idleElevators();
                
                if(idle.length>0)
                {
                    var thisElv = idle.pop();
                    safeGoTo(thisElv, floor.floorNum());
                }*/
            });

            floor.on("down_button_pressed", function(){
               
                var filtered = requests.filter(function(req){
                    return req.floor == floor.floorNum() && req.direction == "down";
                });
                
                if(filtered.length>0){
                    //TODO: Do some calculation about whether or not there's a closer elevator than the one On The way
                }
                else{
                    var elv = findRightElevator(floor.floorNum(), "down");
                    elv.goToFloor(floor.floorNum());
                }
                
                
              //  var filtered = requests.filter(function(req){
              //      return req.floor == floor.floorNum() && req.direction == "down";
              //  });
              //  
              //  var elv = findRightElevator(floor.floorNum(), "down");
              //  elv.goToFloor(floor.floorNum());
              //  requests.push(new request(floor.floorNum(),"down"));
                /*  var filtered = requests.filter(function(req, floorNum){
                    return req.floor == floorNum && req.direction == direction;
                });

                var elv = findRightElevator(floor.floorNum(), "down");
                elv.goToFloor(floor.floorNum());
                

                down[floor.floorNum()] = true;
                var idle = idleElevators();
                
                if(idle.length>0)
                {
                    var thisElv = idle.pop();
                    safeGoTo(thisElv,floor.floorNum());
                }*/
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}