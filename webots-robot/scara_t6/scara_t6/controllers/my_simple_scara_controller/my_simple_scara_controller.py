from controller import Robot, Keyboard

robot = Robot()
timestep = int(robot.getBasicTimeStep())
keyboard = Keyboard()
keyboard.enable(timestep)

base_motor = robot.getDevice("base_arm_motor")

print("Press 'H' for Home, 'B' to move base")

while robot.step(timestep) != -1:
    key = keyboard.getKey()  # فقط از این دستور استفاده کنید
    
    # اگر کلیدی فشرده شده بود (خروجی 1- نبود)
    if key != -1:
        if key == ord('H'):
            print("Moving Home...")
            base_motor.setPosition(0.0)
            
        elif key == ord('B'):
            print("Moving Base...")
            base_motor.setPosition(1.57)