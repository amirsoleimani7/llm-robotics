from django.db import models 

class Conversation(models.Model):

    conversation_id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    lastedited_at = models.DateTimeField(auto_now=True)
    
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
    
    def __str__(self):
        return f"{self.content[:20]}"
    
    def generate_title(self):
        return f"{self.content[:20]}"

    