from django.db import models 

class Conversation(models.Model):

    conversation_id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    lastedited_at = models.DateTimeField(auto_now=True)
    is_pinned = models.BooleanField(default=False)
    
    def __str__(self):
        return f"conv {self.conversation_id} created at {self.created_at}"
    

class Message(models.Model):

    # id is handled by the Django
    ROLES = {
        "system" : "system",
        "user" : "user",
        "assistant" : "assistant",
    }
    
    conversation = models.ForeignKey(
        Conversation , on_delete=models.CASCADE
    )
    
    role = models.CharField(choices=ROLES)
    created_at = models.DateTimeField(auto_now_add=True)
    content = models.CharField()
    video_url = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return f"{self.content[:20]} from =>  {self.conversation.conversation_id}"
    
    def generate_title(self):
        return f"{self.content[:20]}"



class User(models.Model):
    name = models.CharField()
    profile_picture = models.ImageField(upload_to="./storage")
    
    def __str__(self):
        return f"{self.name}"
        
    
    