{
    init: function(elevators, floors) {
         
        var up = [];
        var down = [];
        var requests = [];
      
        var GEN_THRESHOLD = .8;
        var newElevators = [];
        //var reqFilter = function(floor,)
        var request = function(floor,direction){
            var self = this;
            self.floor = floor;
            self.direction = direction;
            self.elv = null;    
            
        }

        var Elevator = function(elevator, baseFloor, isDefaultHome){
            baseFloor= baseFloor || 0;
            var self = this;
            self.elevator = elevator;
            self.isDefaultHome = isDefaultHome;
            
            //DIRECTION IS REFLECTIVE OF TARGET DIRECTION NOT ACTUAL DIRECTION
            self.direction = "idle";
            self.prevFloor = 0;
            
            self.requests = [];
            

            self.isFull = function() {
                
                    return self.elevator.loadFactor()> GEN_THRESHOLD;
            };

            self.addRequest = function(floorNum, direction){
                self.requests.push(new request(floorNum,direction));
                self.goToFloor(floorNum);
                
                self.elevator.destinationQueue.sort(function(a,b){return a-b});
                if(self.elevator.destinationQueue.length >0 && self.elevator.destinationQueue[0]<elevator.currentFloor()){
                    self.elevator.destinationQueue.reverse();    
                }
                else{
                    
                }
                self.elevator.checkDestinationQueue();
            }

            self.setDirection = function(direction){
                self.direction=direction;
                if(direction=="up"){
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(false);
                } else if (direction=="down"){
                    elevator.goingUpIndicator(false);
                    elevator.goingDownIndicator(true);
                } else
                {
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(true);
                }

            }

            self.elevator.on("idle", function() {
                var curr = self.elevator.currentFloor();
            /*    self.setDirection("idle");
                
                if(self.direction=="idle"){
                    self.elevator.goToFloor(curr);
                    self.direction="local";
                }
                else if(self.direction == "local"){*/
                    if(self.isDefaultHome)
                    {
                        //alert();
                        self.setDirection("idle");
                        self.elevator.goToFloor(baseFloor);
                    }
                    else
                    {
                        if(curr>baseFloor)
                            self.setDirection("down");
                        else if (curr<baseFloor)
                            self.setDirection("up");
                        else if (baseFloor==curr){
                            //alert(self.elevator.currentFloor());
                            self.setDirection("idle");
                        }
                        self.elevator.goToFloor(curr);
                        self.elevator.goToFloor(baseFloor);
                        
                    }
            });

            self.elevator.on("floor_button_pressed", function(floorNum){
                if(self.direction == "idle")
                {
                    if(floorNum > self.elevator.currentFloor())
                        self.setDirection("up");
                    else if(floorNum < self.elevator.currentFloor())
                        self.setDirection("down");
                }
                self.elevator.goToFloor(floorNum);
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

            

            self.elevator.on("passing_floor", function(floorNum,direction){
                
                //THIS IS WHERE WE SHOULD CHECK AMICLOSER
                
               
                    if(self.direction == "up" && 
                        !self.isFull() &&
                        up[floorNum] == "yes") {

                        up[floorNum] = "locked";
                        self.elevator.goToFloor(floorNum, true);

                    }
                    if(self.direction == "down" && 
                        !self.isFull() && 
                        down[floorNum] == "yes") {

                        down[floorNum] = "locked";
                        self.elevator.goToFloor(floorNum, true);

                    }
                

            });

            self.elevator.on("stopped_at_floor", function(floorNum){
                alert(floorNum);
                if(self.direction=="up")
                    up[floorNum]="no";
                if(self.direction == "down")
                    down[floorNum]="no";
                
                if(self.direction=="up" && self.elevator.currentFloor() == floors.length-1){
                    self.setDirection("idle");
                }

                if(self.elevator.currentFloor() == floors.length-1 && self.direction=="idle"){
                    self.elevator.goToFloor(0);
                    self.setDirection("down");
                }
                //Make sure top elevator doesn't get stuck doing nothing
                
            });

        };



        //If a floor is 
        var visitedFloor = function(floorNum, direction){
            var filtered = requests.filter(function(req){
                   return req.floor == floor.floorNum() && req.direction == direction;
               });
            if(filtered.length>0){
                var deleteMe = filtered[0];
                requests.splice(requests.indexOf(deleteMe), 1);
            }
            
        }

        
        var x = 1;
        var floorNum = floors.length;
        _.each(elevators,function(elevator){
            var isDefaultHome = false;
            var newBaseLevel = 0;
            if(x%2==0)
            {
                newBaseLevel=floors.length;
            }
          
            x=x+1;
            
            newElevators.push(new Elevator(elevator, newBaseLevel, false));
            //Math.floor(Math.random()*2)*8)


        });
        _.each(floors, function(floor){
            up[floor.floorNum()] = "no";
            down[floor.floorNum()] = "no";
            floor.on("up_button_pressed", function(){
                up[floor.floorNum()] = "yes";
                //var newReq = new Request(floor.floorNum(),"up");
                //requests.push(newReq);

              
            });

            floor.on("down_button_pressed", function(){
                down[floor.floorNum()] = "yes"; 
                //var newReq = new Request(floor.floorNum(),"down");
                //requests.push(newReq);
              
                
              
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}